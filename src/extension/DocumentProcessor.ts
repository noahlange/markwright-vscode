import type * as vscode from 'vscode';

interface ProcessFn {
  (doc: vscode.TextDocument): string | Promise<string>;
}

export class DocumentProcessor {
  private files: Set<string> = new Set();
  private cache: Map<string, [number, string]> = new Map();

  public async processDocs(docs: vscode.TextDocument[], fn: ProcessFn): Promise<string[]> {
    const promises = docs.map(doc => this.processDoc(doc, fn));
    const res = await Promise.all(promises);
    // clear unused files
    for (const file of this.files) {
      this.cache.delete(file);
    }
    this.files = new Set(this.cache.keys());
    return res;
  }

  private async processDoc(doc: vscode.TextDocument, fn: ProcessFn): Promise<string> {
    const [version, cached] = this.cache.get(doc.fileName) ?? [-1, null];
    const text = !cached || doc.version > version ? await fn(doc) : cached;
    this.cache.set(doc.fileName, [doc.version, text]);
    // files that remain once the process() call is done will have their cache entries deleted
    this.files.delete(doc.fileName);
    return text;
  }
}
