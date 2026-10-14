import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const levels = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/levels' }),
  schema: z.object({
    levelId: z.string(),
    track: z.literal('inside'),
    order: z.number().int().min(1),
    title: z.string(),
    summary: z.string(),
    puzzle: z.string(),
    challenge: z.string().optional(),
  }),
});

export const collections = { levels };
