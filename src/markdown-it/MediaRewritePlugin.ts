import type MarkdownIt from 'markdown-it';
import type { Uri } from 'vscode';

interface MediaRewritePluginOptions {
  toResourceUri: (base: Uri, path: string) => string;
}

/**
 * The markdown version of the media rewriter. Embedded content needs to be rewritten using a VSCode
 * resource URI or it won't be displayed due to security concerns.
 */
export function mediaRewritePlugin(md: MarkdownIt, o: MediaRewritePluginOptions): MarkdownIt {
  const old = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, i, options, env, md) => {
    const token = tokens[i];
    const src = token.attrGet('src');
    if (src) {
      token.attrSet('src', o.toResourceUri(env.base, src));
      token.attrSet('data-src', src);
    }
    return old(tokens, i, options, env, md);
  };
  return md;
}
