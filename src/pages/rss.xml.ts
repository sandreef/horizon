import type { APIRoute } from 'astro';
import { getNotes, getRadar, noteUrl } from '../lib/notes';
import { SITE, url } from '../lib/site';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export const GET: APIRoute = async ({ site }) => {
  const [notes, radar] = await Promise.all([getNotes(), getRadar()]);
  const abs = (p: string) => new URL(p, site).href;
  const items = [
    ...notes.map((n) => ({ title: n.data.title, link: abs(noteUrl(n)), date: n.data.date, desc: n.data.summary ?? '' })),
    ...radar.map((r) => ({ title: `Radar: ${r.data.title}`, link: abs(url(`radar/#${r.id}`)), date: r.data.date, desc: r.data.summary })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(SITE.name)}</title><link>${abs(url(''))}</link><description>${esc(SITE.description)}</description><language>en</language>
${items.map((i) => `<item><title>${esc(i.title)}</title><link>${i.link}</link><guid>${i.link}</guid><pubDate>${i.date.toUTCString()}</pubDate><description>${esc(i.desc)}</description></item>`).join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
