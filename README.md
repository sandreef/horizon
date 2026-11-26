# Horizon

A long-term learning notebook: modern C++, system design, agentic AI engineering, and the math and science
underneath. Learning paths to follow, notes that grow over time, an AI radar, a reading library, and a review deck
so it all sticks.

Live site: https://sandreef.github.io/horizon/

Built with [Astro](https://astro.build) as a fully static site. Every push to `main` builds and deploys it to
GitHub Pages through `.github/workflows/deploy.yml`. There is no server, database or account: everything is a file
in this repository.

## What's on the site

| Page | What it's for |
| --- | --- |
| **Home** | Current focus, cards due today, path progress, an activity heatmap, recent notes and radar |
| **Paths** | Four roadmaps (Modern C++, System design, Agentic engineering, Math foundations), each split into stages and steps with what to learn, a practice task, self-check questions and the best resources |
| **Notes** | The garden. Filter by area, type and maturity, or type to filter |
| **Radar** | AI models, tools and practices placed in four rings: adopt, trial, assess, hold |
| **Library** | Curated books, courses and articles, filtered by area, level and free only |
| **Review** | Spaced-repetition flashcards built from the `cards:` in every note |
| **Graph** | Every note and path, and the links between them |
| **Log** | Every note by date |

Press ⌘K (Ctrl+K) or `/` anywhere to search notes, paths, steps, the radar and the library.
The site follows your system's light or dark theme; the sun and moon button switches it.

## The weekly rhythm

1. **Daily, 10 minutes:** open Review and clear the due cards.
2. **Most days:** work on the current step of a path. When you learn something, write or grow a note.
3. **Weekly:** add a radar entry for anything new in AI that matters, update `now.yaml`, and mark finished steps.

## Add a note

Create a Markdown file in `src/content/notes/`. The file name is the note's address, so use lowercase words joined
by dashes: `kv-cache.md` becomes `/horizon/notes/kv-cache/`. Start it with this header:

```markdown
---
title: How the KV cache speeds up inference
date: 2026-12-01
area: ai                # ai, programming, system-design or science-tech
type: concept           # concept, guide, til, design, paper or essay
maturity: seedling      # seedling, budding or evergreen: how finished it feels
milestone: ai-engineering/inference   # optional: the path step it belongs to (path id / step id)
summary: One line shown in lists and search.
tags: [inference]
updated: 2026-12-08     # optional: set when you revise it
cards:                  # optional: recall questions for the review deck
  - q: Why does the KV cache make decoding faster?
    a: Keys and values for earlier tokens are computed once and reused, so each step only processes the new token.
sources:                # optional, shown under the note
  - title: Name of the article or paper
    url: https://example.com/article
draft: false            # true keeps it off the published site
---
```

Then write the note in Markdown. Extras:

- **Links between notes:** `[[kv-cache]]` or `[[kv-cache|the KV cache note]]`. A link to a note that doesn't exist
  yet shows dashed, so you can link first and write later. Links also build the backlinks and the graph.
- **Callouts:** start a quote with `[!note]`, `[!tip]`, `[!question]`, `[!warning]`, `[!summary]` or `[!example]`.
- **Math:** `$inline$` and `$$display$$`, rendered with KaTeX.
- **Code:** fenced code blocks are highlighted and follow the light or dark theme.

If a value contains a colon followed by a space, put it in double quotes, or the header won't parse.

Every note page has an **Edit on GitHub** link, and the Notes page has a **New note** button, so you can write from a
browser without cloning anything.

## Mark progress on a path

Paths live in `src/content/paths/*.yaml`. Each step has a `status`: `todo`, `doing` or `done`. Change it and push;
the rings and progress bars update. Each path page has an **Update progress** link that opens the file on GitHub.

## Update the current focus

`src/data/now.yaml` holds the two or three things you're focused on, shown at the top of the home page:

```yaml
- id: cpp
  title: Modern C++ foundations
  area: programming
  milestone: cpp/toolchain        # optional: links the card to that step
  next: Set up CMake and sanitizers and build a small project.
  since: 2026-11-26
```

## Add a radar entry

Create `src/content/radar/<name>.md`:

```markdown
---
title: Name of the model, tool or practice
date: 2026-12-01
kind: tool              # model, tool, practice, paper or idea
ring: trial             # adopt, trial, assess or hold
summary: One line on what it is.
link: https://example.com
tags: [agents]
---
Your take in a few sentences: why it matters, and what you'd do with it.
```

## Add to the library

Append an entry to `src/data/library.yaml` with `id`, `title`, `by`, `url`, `kind` (book, course, reference, article,
video, repo, paper, newsletter or tool), `area`, `level` (start, core or deep), `status` (queued, reading or done),
`free` and a one-line `why`.

## Starter content

The paths, library, and the notes and radar entries marked `starter: true` were written to get the site going. Those
show a small "starter" badge. Rewrite each one in your own words as you work through it, then remove the
`starter: true` line: that's when it becomes yours.

## Review progress

Review progress is stored in your browser, not in the repository. Use **Export progress** on the Review page to save
it, and **Import** to move it to another device or browser.

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

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/notes/` | Notes |
| `src/content/paths/` | Learning paths and their steps |
| `src/content/radar/` | Radar entries |
| `src/data/library.yaml` | Reading library |
| `src/data/now.yaml` | Current focus |
| `src/content.config.ts` | The fields each kind of content accepts |
| `src/lib/` | Areas, site settings and helpers |
| `src/pages/` | Every page, plus the search index, cards and RSS feed |
| `src/components/` | Shared pieces: cards, rings, the heatmap, search, icons |
| `src/plugins/` | Markdown add-ons for wiki links and callouts |
| `src/styles/global.css` | Colors, type and layout |

## Keep it public-safe

This repository is public, and everything ever committed stays in its history. Keep out personal details,
employer material, and anything copied whole from someone else's work; write summaries in your own words and link
to the original.
