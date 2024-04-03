import { ExtensionContext } from 'vscode';
import { MarkwrightPanel } from '../extension/MarkwrightPanel';

export function open(context: ExtensionContext) {
  return () => MarkwrightPanel.forUri(context.extensionUri);
}
