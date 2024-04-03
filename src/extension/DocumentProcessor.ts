import type * as vscode from 'vscode';

interface ProcessFn {
  (document: vscode.TextDocument): string | Promise<string>;
}

/**
 * Caching is crucial here, especially for longer documents.
 */
export class DocumentProcessor {
  private files: Set<string> = new Set();
  private cache: Record<string, [number, string]> = {};

  public async processDocs(docs: vscode.TextDocument[], fn: ProcessFn): Promise<string[]> {
    const promises = docs.map(doc => this.processDoc(doc, fn));
    const res = await Promise.all(promises);
    // clear unused files
    for (const file of this.files) {
      delete this.cache[file];
    }
    this.files = new Set(Object.keys(this.cache));
    return res;
  }

  private async processDoc(document: vscode.TextDocument, fn: ProcessFn): Promise<string> {
    const [version, cached] = this.cache[document.fileName] ?? [-1, null];
    const text = !cached || document.version > version ? await fn(document) : cached;
    this.cache[document.fileName] = [document.version, text];
    // files that remain once the process() call is finished will have their cache entries deleted
    this.files.delete(document.fileName);
    return text;
  }
}
