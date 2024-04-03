import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token';

const splitTextToken = (text: string, Tok: typeof Token): Token[] => {
  const nodes: Token[] = [];
  let index = 0;

  text.replace(/:\w+:/g, (match: string, offset: number): string => {
    const icon = new Tok('icon', '', 0);
    icon.content = match.slice(1, -1);
    // Add new tokens to pending list
    if (offset > index) {
      const token = new Tok('text', '', 0);
      token.content = text.slice(index, offset);
      nodes.push(token);
    }
    nodes.push(icon);
    index = offset + match.length;
    return '';
  });

  // scoop up any outstanding characters and push them onto the end
  if (index < text.length) {
    const token = new Tok('text', '', 0);
    token.content = text.slice(index);
    nodes.push(token);
  }

  return nodes;
};

/**
 * A MarkdownIt plugin that turns `:icon:` into `<i class="icon"></i>`. This is normally reserved for emojis,
 * a list of which I guess we could cross-check against, but I don't mind using the actual unicode emojis.
 */
export function iconPlugin(md: MarkdownIt): MarkdownIt {
  md.renderer.rules.icon = (token, i): string => `<i class="${token[i].content}"></i>`;

  md.core.ruler.after('linkify', 'icon', state => {
    let level = 0;
    for (const token of state.tokens.filter(t => t.type === 'inline')) {
      let children = token.children ?? [];
      for (let t = children.length - 1; t >= 0; t--) {
        const child = children[t];
        if (child.type === 'link_open' || child.type === 'link_close') {
          if (child.info === 'auto') {
            level -= child.nesting;
          }
        }
        if (child.type === 'text' && level === 0 && /:\w+:/.test(child.content)) {
          const replaced = children.slice();
          const split = splitTextToken(child.content, state.Token);
          replaced.splice(t, 1, ...split);
          token.children = children = replaced;
        }
      }
    }
  });
  return md;
}
