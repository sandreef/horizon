// Turns [[note-id]] and [[note-id|label]] into links to /notes/<note-id>/.
// Without a label, the link shows the note's title.
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

// Maps each note id to its title, so [[note-id]] shows the note's title.
function existingNotes() {
  const notes = new Map();
  try {
    for (const f of fs.readdirSync(NOTES_DIR)) {
      if (!f.endsWith('.md')) continue;
      const text = fs.readFileSync(path.join(NOTES_DIR, f), 'utf8');
      const m = text.match(/^---[\s\S]*?^title:\s*(.+?)\s*$/m);
      const title = m ? m[1].replace(/^(["'])(.*)\1$/, '$2') : null;
      notes.set(f.slice(0, -3), title);
    }
  } catch {}
  return notes;
}

export function remarkWikiLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    const notes = existingNotes();
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('[[')) return;
      const parts = [];
      let last = 0;
      for (const m of node.value.matchAll(WIKI)) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        const id = slugify(m[1]);
        const label = (m[2] ?? (notes.get(id) || m[1])).trim();
        if (notes.has(id)) {
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
