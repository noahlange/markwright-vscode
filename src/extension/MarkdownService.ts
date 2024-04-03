import type { Webview } from 'vscode';

import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import { Disposable, Uri, workspace as ws } from 'vscode';

import { DocumentProcessor } from './DocumentProcessor';
import { blockPlugin, iconPlugin, mediaRewritePlugin, docAnchorPlugin } from '../markdown-it';

export class MarkdownService extends Disposable {
  public options: MarkdownIt.Options = {
    typographer: true,
    html: true,
    xhtmlOut: false,
    linkify: true
  };

  private webview: Webview;
  private md: MarkdownIt = this.getMarkdownIt();
  private processor = new DocumentProcessor();

  public constructor(webview: Webview) {
    super(() => (this.webview = this.md = null!));
    this.webview = webview;
  }

  public async render(files: Uri[]): Promise<string> {
    const docs = await Promise.all(files.map(d => ws.openTextDocument(d)));
    const res = await this.processor.processDocs(
      docs.filter(doc => doc.languageId === 'markdown'),
      doc => this.md.render(doc.getText(), { base: doc.uri, file: doc.fileName })
    );
    return res.join('\n');
  }

  private toResourceUri(base: Uri, src: string): string {
    try {
      const joined = Uri.joinPath(base, '..', src);
      return this.webview.asWebviewUri(joined).toString(true);
    } catch {
      return src;
    }
  }

  private getMarkdownIt(): MarkdownIt {
    return new MarkdownIt(this.options)
      .use(mediaRewritePlugin, { toResourceUri: this.toResourceUri })
      .use(iconPlugin)
      .use(blockPlugin)
      .use(docAnchorPlugin)
      .use(sub)
      .use(sup);
  }
}
