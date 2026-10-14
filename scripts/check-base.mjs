// Fails if any built page links to the domain root instead of the configured base path.
// Usage: node scripts/check-base.mjs /learn-llms   (no argument or "" = root site, nothing to check)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] ?? '').replace(/\/+$/, '');
if (!base) {
  console.log('Root base path: nothing to check.');
  process.exit(0);
}

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(html|js|css)$/.test(name)) files.push(path);
  }
})('dist');

const pattern = /(?:href|src|action|component-url|renderer-url)=["'](\/(?!\/)[^"']*)["']|url\((\/(?!\/)[^)]*)\)/g;
const bad = [];
for (const file of files) {
  for (const m of readFileSync(file, 'utf8').matchAll(pattern)) {
    const url = m[1] ?? m[2];
    if (url !== base && !url.startsWith(`${base}/`)) bad.push(`${file}: ${url}`);
  }
}

if (bad.length > 0) {
  console.error(`Links that ignore the base path "${base}":\n${bad.join('\n')}`);
  process.exit(1);
}
console.log(`OK: ${files.length} files use the base path "${base}".`);
