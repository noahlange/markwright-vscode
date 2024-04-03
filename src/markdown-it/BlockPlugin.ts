import type MarkdownIt from 'markdown-it';
import type { RenderRule } from 'markdown-it/lib/renderer';

import container from 'markdown-it-container';

export function blockPlugin(md: MarkdownIt): MarkdownIt {
  const render: RenderRule = (tokens, i, options, env, renderer) => {
    const token = tokens[i];
    if (token.nesting === 1) {
      token.attrJoin('class', token.info);
    }
    return renderer.renderToken(tokens, i, options);
  };
  return md.use(container, '', { validate: () => true, render });
}
