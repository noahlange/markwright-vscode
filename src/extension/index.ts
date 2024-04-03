import type { ExtensionContext, WebviewPanel } from 'vscode';

import '../styles.css';

import { workspace } from 'vscode';
import { commands, window } from 'vscode';

import { MarkwrightPanel } from './MarkwrightPanel';
import { getWebviewOptions } from '../utils/webview';
import { exportPDF, open } from '../commands';

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand('markwright.export', exportPDF(context)),
    commands.registerCommand('markwright.open', open(context)),
    workspace.onDidSaveTextDocument(() => MarkwrightPanel.current?.updateContent()),
    window.onDidChangeActiveTextEditor(e =>
      MarkwrightPanel.current?.updateFocus(e?.document.fileName)
    )
  );

  // Make sure we register a serializer in activation event
  window.registerWebviewPanelSerializer?.(MarkwrightPanel.view, {
    async deserializeWebviewPanel(webviewPanel: WebviewPanel) {
      // Reset the webview options so we use latest uri for `localResourceRoots`.
      webviewPanel.webview.options = getWebviewOptions(
        context.extensionUri,
        ...(workspace.workspaceFolders?.map(folder => folder.uri) ?? [])
      );
      MarkwrightPanel.revive(context.extensionUri, webviewPanel);
      MarkwrightPanel.current?.updateContent();
    }
  });
}
