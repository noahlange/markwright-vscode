import type { ExtensionContext } from 'vscode';
import { window } from 'vscode';
import { MarkwrightPanel } from '../extension/MarkwrightPanel';

export function exportPDF(context: ExtensionContext) {
  return async () => {
    const filename = await window.showInputBox();
    if (filename) {
      if (!MarkwrightPanel.current) {
        const panel = MarkwrightPanel.forUri(context.extensionUri);
        await panel.exportPDF(filename);
        panel.dispose();
      } else {
        await MarkwrightPanel.current.exportPDF(filename);
      }
    }
  };
}
