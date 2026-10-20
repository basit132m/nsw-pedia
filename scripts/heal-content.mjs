/**
 * Pre-build content repair.
 *
 * The failure mode this exists to kill: one bad entry fails the whole build,
 * Cloudflare keeps serving the previous deploy, and nothing anywhere says so.
 * New articles just never appear.
 *
 * The usual cause is a missing image. Deleting an entry in the CMS deletes
 * its uploaded images too, including ones other entries still reference, and
 * Astro's image() throws when it cannot resolve one.
 *
 * Rather than fail, this strips references to files that are not there and
 * reports what it did. A ROM page missing a screenshot still publishes; a
 * whole site frozen for days does not. Edits are line-surgical so the rest of
 * the frontmatter is untouched, and they show up in git like any other change.
 */
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';

const CONTENT = 'src/content';
const IMAGE_KEYS = /^(\s*)(cover|logo|avatar|banner|src)\s*:\s*['"]?(\.\/[^'"\n]+?\.(?:png|jpe?g|webp|avif|gif|svg))['"]?\s*$/i;
const LIST_IMAGE = /^(\s*)-\s+src\s*:\s*['"]?(\.\/[^'"\n]+?\.(?:png|jpe?g|webp|avif|gif|svg))['"]?\s*$/i;

const WRITE = process.argv.includes('--write');

async function markdownFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await markdownFiles(p)));
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const exists = async (p) => { try { await access(p); return true; } catch { return false; } };
const indentOf = (line) => line.match(/^\s*/)[0].length;

const repaired = [];
const notes = [];

for (const file of await markdownFiles(CONTENT)) {
  const original = await readFile(file, 'utf8');
  const lines = original.split('\n');

  // Frontmatter runs between the first two --- fences.
  const open = lines.findIndex((l) => l.trim() === '---');
  const close = open === -1 ? -1 : lines.findIndex((l, i) => i > open && l.trim() === '---');
  if (open === -1 || close === -1) continue;

  const kept = [];
  let i = open;
  let changed = false;

  while (i < lines.length) {
    const line = lines[i];
    if (i <= open || i >= close) { kept.push(line); i += 1; continue; }

    const list = line.match(LIST_IMAGE);
    if (list) {
      const [, indent, ref] = list;
      if (!(await exists(resolve(dirname(file), ref)))) {
        // Drop the item and every line belonging to it.
        const base = indent.length;
        let j = i + 1;
        while (j < close && lines[j].trim() !== '' && indentOf(lines[j]) > base) j += 1;
        repaired.push({ file, ref, what: 'screenshot removed' });
        changed = true;
        i = j;
        continue;
      }
    }

    const single = line.match(IMAGE_KEYS);
    if (single) {
      const [, , key, ref] = single;
      if (!(await exists(resolve(dirname(file), ref)))) {
        repaired.push({ file, ref, what: `${key} cleared` });
        changed = true;
        i += 1;
        continue;
      }
    }

    kept.push(line);
    i += 1;
  }

  if (changed && WRITE) await writeFile(file, kept.join('\n'));

  // Soft observations — never block, just surface.
  const body = original.split(/^---$/m).slice(2).join('---').trim();
  if (body.split(/\s+/).filter(Boolean).length === 0 && !/draft:\s*true/.test(original)) {
    notes.push({ file, note: 'no body text' });
  }
}

if (repaired.length) {
  console.warn('\n⚠  Content repaired so the build can continue:\n');
  for (const r of repaired) console.warn(`    ${r.file}\n      ${r.what}: ${r.ref} (file not found)\n`);
  console.warn('  These entries published without those images. Re-upload them in the');
  console.warn('  admin panel. Deleting an entry also deletes images other entries use.\n');
} else {
  console.log('✓ Content check: all image references resolve.');
}

if (notes.length) {
  console.log('\n  Notes (not blocking):');
  for (const n of notes) console.log(`    ${n.file} — ${n.note}`);
  console.log('');
}
