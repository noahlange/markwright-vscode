import type { Webview, WebviewOptions } from 'vscode';

import { Uri } from 'vscode';

export function getWebviewOptions(extensionUri: Uri, ...workspace: Uri[]): WebviewOptions {
  return {
    // enable JS in the webview
    enableScripts: true,
    // restrict the webview to only loading content from our extension's `dist` directory.
    localResourceRoots: [Uri.joinPath(extensionUri, 'dist'), ...workspace]
  };
}

export function getWebviewCSP(webview: Webview): string {
  return Object.entries({
    'default-src': 'none',
    'img-src': `${webview.cspSource} https:`,
    'script-src': `${webview.cspSource}`,
    // pagedjs inserts inline stykles
    'style-src': `${webview.cspSource} 'unsafe-inline'`
  })
    .map(val => val.join(' '))
    .join(';');
}

export function getWebviewHTML(uri: Uri, webview: Webview): string {
  // Local path to main script run in the webview
  const script = Uri.joinPath(uri, 'dist', 'client.js');
  const styles = Uri.joinPath(uri, 'dist', 'extension.css');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Security-Policy" content="${getWebviewCSP(webview)}" />
        <link href="${webview.asWebviewUri(styles)}" rel="stylesheet" />
        <title>Markwright</title>
      </head>
      <body>
        <main id="root"></main>
        <div id="ui">
          <vscode-progress-ring id="loading"></vscode-progress-ring>
          <div id="toolbar">
            <vscode-button id="toggle-spread" appearance="icon" aria-label="Toggle spread"></vscode-button>
          </div>
        </div>
        <script type="module" src="${webview.asWebviewUri(script)}"></script>
      </body>
    </html>
    `;
}
