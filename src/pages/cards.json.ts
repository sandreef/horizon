import type { APIRoute } from 'astro';
import { cardsOf, getNotes } from '../lib/notes';
import { inlineMd } from '../lib/site';

// Every recall question from every note, for the Review page.
export const GET: APIRoute = async () => {
  const cards = (await getNotes()).flatMap(cardsOf).map((c) => ({ ...c, q: inlineMd(c.q), a: inlineMd(c.a) }));
  return new Response(JSON.stringify(cards), { headers: { 'Content-Type': 'application/json' } });
};
