import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { AREA_IDS } from './lib/areas';

const notes = defineCollection({
  // Every .md file in src/content/notes is a note. Its file name is its id and URL.
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    // The day you wrote the note (YYYY-MM-DD).
    date: z.coerce.date(),
    // The day you last changed it in a meaningful way (optional).
    updated: z.coerce.date().optional(),
    area: z.enum(AREA_IDS),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Where you learned it: links to articles, papers, talks, courses.
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
    // Drafts show in `npm run dev` but are left out of the published site.
    draft: z.boolean().default(false),
    // Marks the starter notes that ship with the site; delete them when you're ready.
    sample: z.boolean().default(false),
  }),
});

export const collections = { notes };
