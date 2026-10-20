/**
 * Pre-build content check.
 *
 * Deleting an entry in the CMS also deletes its uploaded images — even when
 * another entry still references them. Astro then fails the build with a Vite
 * resolver stack trace that does not name the entry at fault, and because the
 * build fails, Cloudflare keeps serving the previous deploy: new articles
 * silently never appear.
 *
 * This runs first and says plainly which entry points at which missing file.
 */
import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';

const CONTENT = 'src/content';

async function markdownFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await markdownFiles(p)));
    else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const files = await markdownFiles(CONTENT);
const problems = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const frontmatter = text.split(/^---$/m)[1] ?? '';
  // Relative image paths, quoted or bare, as the CMS writes them.
  const refs = frontmatter.matchAll(/(?:^|[\s:[-])['"]?(\.\/[^'"\n]+?\.(?:png|jpe?g|webp|avif|gif|svg))['"]?\s*$/gim);
  for (const [, ref] of refs) {
    const target = resolve(dirname(file), ref);
    try {
      await access(target);
    } catch {
      problems.push({ file, ref });
    }
  }
}

if (problems.length) {
  console.error('\n✗ Content check failed — these entries reference images that do not exist:\n');
  for (const { file, ref } of problems) console.error(`    ${file}\n      -> ${ref}\n`);
  console.error('  Re-upload the image in the admin panel, or clear that field on the entry.');
  console.error('  Deleting an entry removes its images, even ones another entry still uses.\n');
  process.exit(1);
}

console.log(`✓ Content check passed — ${files.length} entries, all image references resolve.`);
