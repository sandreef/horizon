import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from '../plugins/remark-wiki-links.mjs';

export type Note = CollectionEntry<'notes'>;

/** Published notes, newest first. Drafts are included only in `npm run dev`. */
export async function getNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft);
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** Prefixes a site path with the base path (/horizon). */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export function noteUrl(note: Note): string {
  return url(`notes/${note.id}/`);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Notes that link to `id` with [[id]] or [[id|label]]. */
export function backlinks(all: Note[], id: string): Note[] {
  return all.filter((n) => {
    if (n.id === id) return false;
    for (const m of (n.body ?? '').matchAll(/\[\[([^\[\]|]+?)(?:\|[^\[\]]+?)?\]\]/g)) {
      if (slugify(m[1]) === id) return true;
    }
    return false;
  });
}

/** Plain text of a note body, for the search index. */
export function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>\s*\[!\w+\]/gm, '')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
