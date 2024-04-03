import type MarkdownIt from 'markdown-it';

export function docAnchorPlugin(md: MarkdownIt): MarkdownIt {
  const oldRule = md.renderer.rules.heading_open;
  md.renderer.rules.heading_open = (tokens, i, options, env, renderer) => {
    const token = tokens[i];
    if (token.tag === 'h1') {
      token.attrSet('data-src', env.file);
    }
    return (
      oldRule?.call(null, tokens, i, options, env, renderer) ??
      md.renderer.renderToken(tokens, i, options)
    );
  };
  return md;
}
