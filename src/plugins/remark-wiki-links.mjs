// Turns [[note-id]] and [[note-id|label]] into links to /notes/<note-id>/.
// A note's id is its file name in src/content/notes without ".md".
// Links to notes that don't exist yet are rendered as plain text with a
// "missing" style, so you can write links before writing the note.
import fs from 'node:fs';
import path from 'node:path';
import { visit, SKIP } from 'unist-util-visit';

const NOTES_DIR = path.resolve('src/content/notes');
const WIKI = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;

export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function existingIds() {
  try {
    return new Set(
      fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)),
    );
  } catch {
    return new Set();
  }
}

export function remarkWikiLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    const ids = existingIds();
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('[[')) return;
      const parts = [];
      let last = 0;
      for (const m of node.value.matchAll(WIKI)) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        const id = slugify(m[1]);
        const label = (m[2] ?? m[1]).trim();
        if (ids.has(id)) {
          parts.push({
            type: 'link',
            url: `${prefix}/notes/${id}/`,
            data: { hProperties: { className: ['wiki-link'] } },
            children: [{ type: 'text', value: label }],
          });
        } else {
          parts.push({
            type: 'text',
            value: label,
            data: {
              hName: 'span',
              hProperties: { className: ['wiki-link', 'wiki-link-missing'], title: `No note "${id}" yet` },
              hChildren: [{ type: 'text', value: label }],
            },
          });
        }
        last = m.index + m[0].length;
      }
      if (parts.length === 0) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return [SKIP, index + parts.length];
    });
  };
}
