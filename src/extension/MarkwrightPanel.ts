import * as vscode from 'vscode';
import { Uri } from 'vscode';

import { MarkdownService } from './MarkdownService';
import { PostCSSService } from './PostCSSService';
import { getWebviewHTML, getWebviewOptions } from '../utils/webview';
import { posix } from 'path';

enum RenderStatus {
  IDLE = 0,
  WORKING = 1,
  PENDING = 2
}

/**
 * Manages cat coding webview panels
 */
export class MarkwrightPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static current: MarkwrightPanel | null = null;
  public static readonly view = 'markwright';
  public static readonly channel = vscode.window.createOutputChannel('markwright');

  public get workspace() {
    return vscode.workspace.name;
  }

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: Uri;
  private readonly _md: MarkdownService;
  private readonly _css: PostCSSService;
  private readonly _disposables: vscode.Disposable[] = [];

  private status: RenderStatus = RenderStatus.IDLE;
  private diagnostics = vscode.languages.createDiagnosticCollection('Markwright');

  private constructor(panel: vscode.WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._md = new MarkdownService(this._panel.webview);
    this._css = new PostCSSService(this._panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    // Update the content based on view changes
    this._panel.onDidChangeViewState(() => this.updateContent(), null, this._disposables);
    // Set the webview's initial html content
    this._panel.webview.html = getWebviewHTML(this._extensionUri, this._panel.webview);
    this.updateContent();
  }

  public static forUri(extensionUri: Uri): MarkwrightPanel {
    // If we already have a panel, show it.
    if (MarkwrightPanel.current) {
      MarkwrightPanel.current._panel.reveal(vscode.ViewColumn.Two, true);
    } else {
      // Otherwise, create a new panel.
      const options = getWebviewOptions(
        extensionUri,
        ...(vscode.workspace.workspaceFolders?.map(folder => folder.uri) ?? [])
      );

      const panel = vscode.window.createWebviewPanel(
        MarkwrightPanel.view,
        'Markwright',
        vscode.ViewColumn.Two,
        options
      );

      this.revive(extensionUri, panel);
    }

    return MarkwrightPanel.current!;
  }

  public static revive(extensionUri: Uri, panel: vscode.WebviewPanel): void {
    MarkwrightPanel.current = new MarkwrightPanel(panel, extensionUri);
    MarkwrightPanel.current.updateContent();
  }

  public async updateFocus(filename?: string): Promise<void> {
    if (filename) {
      this._panel.webview.postMessage({ type: 'document', id: filename });
    }
  }

  public async exportHTML(filename: string): Promise<void> {
    this._panel.webview.postMessage({ type: 'export', filename });
    this._panel.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'export.content': {
          const buffer = Buffer.from(message.content, 'utf8');
          const folderUri = vscode.workspace.workspaceFolders?.[0].uri;
          if (folderUri) {
            const fileUri = folderUri.with({ path: posix.join(folderUri.path, filename) });
            await vscode.workspace.fs.writeFile(fileUri, buffer);
            vscode.window.showTextDocument(fileUri);
          }
        }
      }
    });
  }

  public async updateContent(): Promise<void> {
    if (this.status === RenderStatus.WORKING) {
      this.status = RenderStatus.PENDING;
      return;
    }

    this.status = RenderStatus.WORKING;

    const documents = await vscode.workspace
      .findFiles('**/*.{md,markdown,css,pcss,postcss}')
      .then(files => files.sort((a, b) => a.path.localeCompare(b.path)));

    const [html, css] = await Promise.all([
      this._md.render(documents),
      this._css.render(documents)
    ]);

    if (html || css) {
      // Send a message to the webview.
      this._panel.webview.postMessage({ type: 'content', html, css });
    }

    if (this.status !== RenderStatus.WORKING) {
      return this.updateContent();
    }

    this.status = RenderStatus.IDLE;
  }

  public dispose(): void {
    MarkwrightPanel.current = null;
    // Clean up our resources
    this._panel.dispose();
    this._md.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}
