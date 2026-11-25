// Obsidian-style callouts:
//
//   > [!note] Optional title
//   > Body text
//
// Types: note, tip, question, warning, summary (anything else is styled like note).
import { visit } from 'unist-util-visit';

const MARKER = /^\[!(\w+)\][ \t]*(.*)/;
const TITLES = { note: 'Note', tip: 'Tip', question: 'Question', warning: 'Warning', summary: 'Summary' };

export function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children[0];
      if (!first || first.type !== 'paragraph') return;
      const text = first.children[0];
      if (!text || text.type !== 'text') return;
      const m = text.value.match(MARKER);
      if (!m) return;

      const type = m[1].toLowerCase();
      // The title is the rest of the first line; anything after the newline is body.
      const [titleLine, ...rest] = m[2].split('\n');
      const title = titleLine.trim() || TITLES[type] || type[0].toUpperCase() + type.slice(1);
      const remainder = rest.join('\n');
      if (remainder) text.value = remainder;
      else first.children.shift();
      if (first.children.length === 0) node.children.shift();

      node.data = {
        hName: 'aside',
        hProperties: { className: ['callout', `callout-${type}`] },
      };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'p', hProperties: { className: ['callout-title'] } },
        children: [{ type: 'text', value: title }],
      });
    });
  };
}
