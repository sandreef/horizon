export const SITE = {
  name: 'Horizon',
  tagline: 'A long-term notebook for becoming a stronger engineer.',
  description:
    'A public learning notebook: modern C++, system design, AI agents, and the math and science behind them. Learning paths, notes, a review deck, and a radar of AI developments.',
  repo: 'https://github.com/sandreef/horizon',
  branch: 'main',
};

/** Prefixes a site path with the base path (/horizon). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/** Link that opens a file of this repository in GitHub's web editor. */
export function editUrl(repoPath: string): string {
  return `${SITE.repo}/edit/${SITE.branch}/${repoPath}`;
}

/** Link that starts a new file in a folder of this repository on GitHub. */
export function newFileUrl(folder: string): string {
  return `${SITE.repo}/new/${SITE.branch}/${folder}`;
}

export function formatDate(d: Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }): string {
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Small, stable string hash (for card ids). */
export function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Escapes text and renders `code`, **bold** and *italic*: enough for review cards. */
export function inlineMd(s: string): string {
  const esc = s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  return esc
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>');
}
