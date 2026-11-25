---
title: "Sample: how a note works"
date: 2026-11-25
area: programming
summary: A starter note that shows the format. Delete it once you have your own notes.
tags: [meta]
sample: true
sources:
  - title: Markdown guide (Astro docs)
    url: https://docs.astro.build/en/guides/markdown-content/
---

> [!note] This is a sample
> It ships with the site to show the structure. Replace it with your own note, or delete the file.

Every note is one Markdown file in `src/content/notes/`. The file name becomes the note's address, so this file,
`sample-how-a-note-works.md`, lives at `/horizon/notes/sample-how-a-note-works/`.

## The header

The block between the `---` lines at the top sets the title, the date you wrote it, which of the four areas it
belongs to, an optional one-line summary, tags, and the sources you learned it from.

## Linking notes

Write `[[sample-scaled-dot-product-attention]]` to link to another note by its file name: [[sample-scaled-dot-product-attention]].
Give it a different label with a bar: [[sample-design-note-template|the design note template]].
A link to a note that doesn't exist yet shows in a dashed style, like [[a-note-for-later]], so you can link first and
write later.

## Callouts

> [!tip] Tip
> Start a quote with `[!tip]`, `[!note]`, `[!question]`, `[!warning]` or `[!summary]` to make a callout box.

## Code and math

```python
def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs)
```

Inline math uses single dollar signs, like $e^{i\pi} + 1 = 0$, and display math uses two:

$$
\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i
$$
