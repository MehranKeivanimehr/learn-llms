import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow.
// BASE_PATH is '' for a <user>.github.io repo and '/<repo>' for a project repo.
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  integrations: [react(), mdx()],
});
