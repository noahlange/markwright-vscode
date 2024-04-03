import { Viewer } from './Viewer';

interface DocumentChangeData {
  type: 'document';
  id: string;
}

interface ContentChangeData {
  type: 'content';
  html: string;
  css: string;
}

interface ExportData {
  type: 'export';
  filename: string;
}

// remove VSCode theme styles
document.body.parentElement?.setAttribute('style', '');
document.body.setAttribute('class', '');
document.body.setAttribute('data-vscode-theme-name', '');
document.body.setAttribute('data-vscode-theme-kind', '');

const view = new Viewer();
const vscode = acquireVsCodeApi();

window.addEventListener(
  'message',
  (e: MessageEvent<ContentChangeData | DocumentChangeData | ExportData>) => {
    switch (e.data.type) {
      case 'document': {
        return view.focus(e.data.id);
      }
      case 'content': {
        return view.render(e.data);
      }
      case 'export': {
        const html = [
          ...Array.from(document.querySelectorAll(`head *:not(script)`), e => e.outerHTML),
          ...Array.from(document.querySelectorAll(`body *:not(script)`), e => e.outerHTML)
        ].join('');

        vscode.postMessage({
          command: 'export.content',
          content: `<html>${html}</html>`.replaceAll('&quot;', '')
        });
      }
    }
  }
);
