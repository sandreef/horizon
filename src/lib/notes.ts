import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from '../plugins/remark-wiki-links.mjs';
import { hash, url } from './site';

export { url, formatDate, isoDate } from './site';

export type Note = CollectionEntry<'notes'>;
export type RadarEntry = CollectionEntry<'radar'>;
export type Path = CollectionEntry<'paths'>;
export type Milestone = Path['data']['stages'][number]['milestones'][number];

const byDate = <T extends { id: string; data: { date: Date } }>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id);

/** Published notes, newest first. Drafts are included only in `npm run dev`. */
export async function getNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft);
  return notes.sort(byDate);
}

const RING_ORDER = ['adopt', 'trial', 'assess', 'hold'];

/** Radar entries, newest first; on the same day, inner rings first. */
export async function getRadar(): Promise<RadarEntry[]> {
  return (await getCollection('radar')).sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      RING_ORDER.indexOf(a.data.ring) - RING_ORDER.indexOf(b.data.ring) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export async function getPaths(): Promise<Path[]> {
  return (await getCollection('paths')).sort((a, b) => a.data.order - b.data.order);
}

export function noteUrl(note: Note): string {
  return url(`notes/${note.id}/`);
}

export function pathUrl(path: Path | string, milestone?: string): string {
  const id = typeof path === 'string' ? path : path.id;
  return url(`paths/${id}/`) + (milestone ? `#${milestone}` : '');
}

export const MATURITY = {
  seedling: { label: 'Seedling', hint: 'Rough and early: an idea being planted.' },
  budding: { label: 'Budding', hint: 'Taking shape, still being revised.' },
  evergreen: { label: 'Evergreen', hint: 'Stable and trusted: worth relying on.' },
} as const;

export const NOTE_TYPES = {
  concept: 'Concept',
  guide: 'Guide',
  til: 'Today I learned',
  design: 'Design study',
  paper: 'Paper',
  essay: 'Essay',
} as const;

/** Wiki-link targets in a note body. */
export function outlinks(note: Note): string[] {
  const ids = new Set<string>();
  for (const m of (note.body ?? '').matchAll(/\[\[([^\[\]|]+?)(?:\|[^\[\]]+?)?\]\]/g)) ids.add(slugify(m[1]));
  ids.delete(note.id);
  return [...ids];
}

/** Notes that link to `id` with [[id]] or [[id|label]]. */
export function backlinks(all: Note[], id: string): Note[] {
  return all.filter((n) => n.id !== id && outlinks(n).includes(id));
}

/** Other notes sharing the most tags (then area). */
export function related(all: Note[], note: Note, limit = 3): Note[] {
  const tags = new Set(note.data.tags);
  return all
    .filter((n) => n.id !== note.id)
    .map((n) => ({ n, s: n.data.tags.filter((t) => tags.has(t)).length * 2 + (n.data.area === note.data.area ? 1 : 0) }))
    .filter((x) => x.s > 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.n);
}

export function readingMinutes(md: string): number {
  return Math.max(1, Math.round(plainText(md).split(' ').length / 230));
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

export type Card = { id: string; q: string; a: string; note: string; title: string; url: string; area: string };

export function cardsOf(note: Note): Card[] {
  return note.data.cards.map((c) => ({
    id: `${note.id}:${hash(c.q)}`,
    q: c.q,
    a: c.a,
    note: note.id,
    title: note.data.title,
    url: noteUrl(note),
    area: note.data.area,
  }));
}

// ---- Paths ----

export function milestones(path: Path): Milestone[] {
  return path.data.stages.flatMap((s) => s.milestones);
}

export function progress(path: Path) {
  const all = milestones(path);
  const done = all.filter((m) => m.status === 'done').length;
  const doing = all.filter((m) => m.status === 'doing').length;
  const total = all.length;
  const current =
    all.find((m) => m.status === 'doing') ?? all.find((m) => m.status === 'todo') ?? all[all.length - 1];
  const stageIndex = path.data.stages.findIndex((s) => s.milestones.includes(current));
  return { done, doing, total, pct: total ? Math.round(((done + doing * 0.5) / total) * 100) : 0, current, stageIndex };
}

/** Finds "path/milestone" across paths. */
export function findMilestone(paths: Path[], ref?: string) {
  if (!ref) return undefined;
  const [pid, mid] = ref.split('/');
  const path = paths.find((p) => p.id === pid);
  const milestone = path && milestones(path).find((m) => m.id === mid);
  return path && milestone ? { path, milestone } : undefined;
}

// ---- Activity ----

/** Days with something written or updated, for the activity map. */
export function activity(notes: Note[], radar: RadarEntry[]): Map<string, number> {
  const days = new Map<string, number>();
  const add = (d?: Date) => {
    if (!d) return;
    const k = d.toISOString().slice(0, 10);
    days.set(k, (days.get(k) ?? 0) + 1);
  };
  for (const n of notes) {
    add(n.data.date);
    if (n.data.updated && n.data.updated.getTime() !== n.data.date.getTime()) add(n.data.updated);
  }
  for (const r of radar) add(r.data.date);
  return days;
}
