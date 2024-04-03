import type { Webview } from 'vscode';

import postcss, { Processor } from 'postcss';
import nesting from 'postcss-nesting';
import parser from 'postcss-scss';
import { Disposable, Uri, workspace as ws, window } from 'vscode';

import { DocumentProcessor } from './DocumentProcessor';
import getRewriteMediaPlugin from '../postcss/MediaRewritePlugin';

export class PostCSSService extends Disposable {
  private static NestingPlugin = nesting();
  private webview: Webview;
  private postcss: Processor;
  private processor = new DocumentProcessor();
  private cached = '';

  public constructor(webview: Webview) {
    super(() => {
      // this.webview = this.postcss = null!
    });
    this.webview = webview;
    this.postcss = postcss([
      PostCSSService.NestingPlugin,
      getRewriteMediaPlugin({ toResourceUri: this.toResourceUri })
    ]);
  }

  public async render(files: Uri[]): Promise<string> {
    try {
      const docs = await Promise.all(files.map(d => ws.openTextDocument(d)));
      const css = await this.processor.processDocs(
        docs.filter(doc => /css$/i.test(doc.languageId)),
        doc =>
          this.postcss
            .process(doc.getText(), { parser, from: doc.uri.fsPath })
            .then(res => res.css)
      );
      return (this.cached = css.join('\n'));
    } catch (e) {
      window.showErrorMessage('PostCSS compilation failed.');
      return this.cached;
    }
  }

  private toResourceUri = (base: Uri, src: string): string => {
    try {
      const joined = Uri.joinPath(base, '..', src);
      return this.webview.asWebviewUri(joined).toString(true);
    } catch {
      return src;
    }
  };
}
