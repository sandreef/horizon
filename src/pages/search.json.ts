import type { APIRoute } from 'astro';
import { areaById } from '../lib/areas';
import { getNotes, isoDate, noteUrl, plainText } from '../lib/notes';

export const GET: APIRoute = async () => {
  const notes = await getNotes();
  const index = notes.map((n) => ({
    title: n.data.title,
    url: noteUrl(n),
    area: areaById(n.data.area)?.name ?? n.data.area,
    date: isoDate(n.data.date),
    summary: n.data.summary ?? '',
    tags: n.data.tags,
    text: plainText(n.body ?? '').slice(0, 5000),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
};
