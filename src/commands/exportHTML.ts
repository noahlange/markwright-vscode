import type { ExtensionContext } from 'vscode';
import { window } from 'vscode';
import { MarkwrightPanel } from '../extension/MarkwrightPanel';

export function exportHTML(context: ExtensionContext) {
  return async () => {
    const filename = await window.showInputBox({
      value: MarkwrightPanel.current
        ? `${MarkwrightPanel.current.workspace}.html`
        : ''
    });
    if (filename) {
      if (!MarkwrightPanel.current) {
        const panel = MarkwrightPanel.forUri(context.extensionUri);
        await panel.exportHTML(filename);
        panel.dispose();
      } else {
        await MarkwrightPanel.current.exportHTML(filename);
      }
    }
  };
}
