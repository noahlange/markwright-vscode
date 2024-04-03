import type { Plugin } from 'postcss';

import { Uri } from 'vscode';

interface MediaRewritePluginOptions {
  toResourceUri: (base: Uri, path: string) => string;
}

/**
 * Q. Why does this exist?
 * A. Asset paths need to be rewritten using a resource URI or VSCode will block them.
 */
export default function getRewriteMediaPlugin(o: MediaRewritePluginOptions): Plugin {
  return {
    postcssPlugin: 'postcss-vscode-rewrite',
    Declaration: decl => {
      // CSS document
      const from = decl.root().source?.input.from;
      if (from) {
        const base = Uri.file(from);
        const assetRE = /url\(["']?([\w\-./]+)['"]?\)/gim;
        for (const [, src] of [...decl.value.matchAll(assetRE)]) {
          decl.value = `url(${o.toResourceUri(base, src)})`;
        }
      }
    }
  };
}
