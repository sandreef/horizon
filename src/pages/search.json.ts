import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { areaById } from '../lib/areas';
import { NOTE_TYPES, getNotes, getPaths, getRadar, noteUrl, pathUrl, plainText } from '../lib/notes';
import { url } from '../lib/site';

export const GET: APIRoute = async () => {
  const [notes, paths, radar, library] = await Promise.all([getNotes(), getPaths(), getRadar(), getCollection('library')]);
  const index = [
    ...notes.map((n) => ({
      kind: 'note',
      title: n.data.title,
      url: noteUrl(n),
      sub: [areaById(n.data.area)?.name, NOTE_TYPES[n.data.type], n.data.summary].filter(Boolean).join(' · '),
      text: `${n.data.tags.join(' ')} ${plainText(n.body ?? '')}`.slice(0, 6000),
    })),
    ...paths.map((p) => ({ kind: 'path', title: p.data.title, url: pathUrl(p), sub: p.data.tagline, text: p.data.why })),
    ...paths.flatMap((p) =>
      p.data.stages.flatMap((s) =>
        s.milestones.map((m) => ({
          kind: 'step',
          title: m.title,
          url: pathUrl(p, m.id),
          sub: `${p.data.title} · ${s.title}`,
          text: [...m.learn, m.practice ?? '', ...m.check].join(' '),
        })),
      ),
    ),
    ...radar.map((r) => ({
      kind: 'radar',
      title: r.data.title,
      url: url(`radar/#${r.id}`),
      sub: `${r.data.ring} · ${r.data.summary}`,
      text: `${r.data.tags.join(' ')} ${plainText(r.body ?? '')}`,
    })),
    ...library.map((l) => ({
      kind: 'library',
      title: l.data.title,
      url: url(`library/#${l.id}`),
      sub: [l.data.by, l.data.kind].filter(Boolean).join(' · '),
      text: l.data.why,
    })),
  ];
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
};
