import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { AREA_IDS } from './lib/areas';

const source = z.object({ title: z.string(), url: z.string().url() });

// Notes: every .md file in src/content/notes. Its file name is its id and address.
const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    // The day you wrote the note (YYYY-MM-DD).
    date: z.coerce.date(),
    // The day you last changed it in a meaningful way.
    updated: z.coerce.date().optional(),
    area: z.enum(AREA_IDS),
    // What kind of note it is.
    type: z.enum(['concept', 'guide', 'til', 'design', 'paper', 'essay']).default('concept'),
    // How finished it is: seedling (rough), budding (taking shape), evergreen (stable, trusted).
    maturity: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // A milestone on a learning path this note belongs to, as "path/milestone", e.g. "cpp/ownership".
    milestone: z.string().optional(),
    // Recall questions for the Review page (spaced repetition).
    cards: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(source).default([]),
    // Drafts show in `npm run dev` but are left out of the published site.
    draft: z.boolean().default(false),
    // Starter notes that ship with the site, to rewrite in your own words.
    starter: z.boolean().default(false),
  }),
});

// Radar: short entries on AI developments, tools and practices worth tracking.
const radar = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/radar' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['model', 'tool', 'practice', 'paper', 'idea']),
    // adopt: use it now · trial: try it on real work · assess: read up · hold: not for now
    ring: z.enum(['adopt', 'trial', 'assess', 'hold']),
    summary: z.string(),
    link: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    starter: z.boolean().default(false),
  }),
});

const resource = z.object({
  title: z.string(),
  url: z.string().url(),
  kind: z.enum(['book', 'course', 'reference', 'article', 'video', 'repo', 'paper', 'tool']).default('article'),
});

// Paths: one YAML file per learning path in src/content/paths.
const paths = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/paths' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    area: z.enum(AREA_IDS),
    tagline: z.string(),
    why: z.string(),
    outcome: z.string(),
    stages: z.array(
      z.object({
        title: z.string(),
        summary: z.string(),
        milestones: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            // todo · doing · done. Change it here to move your progress.
            status: z.enum(['todo', 'doing', 'done']).default('todo'),
            learn: z.array(z.string()).default([]),
            practice: z.string().optional(),
            check: z.array(z.string()).default([]),
            resources: z.array(resource).default([]),
          }),
        ),
      }),
    ),
  }),
});

// Library: books, courses and references, in one file.
const library = defineCollection({
  loader: file('./src/data/library.yaml'),
  schema: z.object({
    title: z.string(),
    by: z.string().optional(),
    url: z.string().url(),
    kind: z.enum(['book', 'course', 'reference', 'article', 'video', 'repo', 'paper', 'newsletter', 'tool']),
    area: z.enum(AREA_IDS),
    level: z.enum(['start', 'core', 'deep']),
    status: z.enum(['queued', 'reading', 'done']).default('queued'),
    free: z.boolean().default(false),
    why: z.string(),
  }),
});

// Now: what you're focused on at the moment, shown on the home page.
const now = defineCollection({
  loader: file('./src/data/now.yaml'),
  schema: z.object({
    title: z.string(),
    area: z.enum(AREA_IDS),
    milestone: z.string().optional(),
    next: z.string(),
    since: z.coerce.date(),
  }),
});

export const collections = { notes, radar, paths, library, now };
