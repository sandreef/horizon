# Horizon

A public notebook of what I'm learning: advanced AI, programming, system design, and science and technology.
Notes are written in my own words, dated, and link to their sources.

Live site: https://sandreef.github.io/horizon/

Built with [Astro](https://astro.build). Every push to `main` builds and deploys the site to GitHub Pages
through `.github/workflows/deploy.yml`.

## Add a note

1. Create a Markdown file in `src/content/notes/`. The file name is the note's address, so use lowercase words
   joined by dashes, for example `kv-cache.md` → `/horizon/notes/kv-cache/`.
2. Start it with this header:

   ```markdown
   ---
   title: How the KV cache speeds up inference
   date: 2026-11-25
   area: ai            # ai, programming, system-design or science-tech
   summary: One line shown in lists and search.   # optional
   tags: [inference]  # optional
   sources:           # optional, shown under the note
     - title: Name of the article or paper
       url: https://example.com/article
   draft: false       # true keeps it off the published site
   ---
   ```

3. Write the note below the header in Markdown. Extras you can use:
   - **Links between notes:** `[[kv-cache]]` or `[[kv-cache|the KV cache note]]`. Links to notes that don't exist
     yet show dashed, so you can link first and write later.
   - **Callouts:** start a quote with `[!note]`, `[!tip]`, `[!question]`, `[!warning]` or `[!summary]`.
   - **Math:** `$inline$` and `$$display$$` (rendered with KaTeX).
4. Commit and push to `main`. The site updates a minute or two later.

The four notes named `sample-*.md` are starter examples. Delete them once you have notes of your own.

## Run it locally

Needs Node 22 (22.23.4 or newer).

```sh
git clone https://github.com/sandreef/horizon.git
cd horizon
npm install
npm run dev
```

Then open http://localhost:4321/horizon/. Drafts show in `npm run dev` but not on the published site.
`npm run build` builds the site into `dist/`, and `npm run preview` serves that build.

## Search

Press ⌘K (Ctrl+K on Windows and Linux) or `/` on any page. The index is built at deploy time from the notes, so
there's no server or third-party service.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/notes/` | The notes |
| `src/lib/areas.ts` | The four areas: names and descriptions |
| `src/pages/` | Home, area pages, the log, note pages, search index |
| `src/plugins/` | Markdown add-ons for wiki links and callouts |
| `src/styles/global.css` | Colors and layout |

## Keep it public-safe

This repository is public, and everything ever committed stays in its history. Keep out personal details,
employer material, and anything copied whole from someone else's work; write summaries in your own words and link
to the original.
