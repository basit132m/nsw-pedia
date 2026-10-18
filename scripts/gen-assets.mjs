/**
 * Generates brand assets from the logo: the default OG card, the favicon set,
 * and neutral placeholder art for seed content. Re-runnable.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const LOGO = 'public/logo.webp';
const out = async (p, buf) => {
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, buf);
  console.log('  ✓', p);
};

const bg = (w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="r" cx="18%" cy="28%" r="62%">
      <stop offset="0%" stop-color="#f80000" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#f80000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="84%" cy="74%" r="62%">
      <stop offset="0%" stop-color="#2e9bff" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#2e9bff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#06080c"/>
  <rect width="${w}" height="${h}" fill="url(#r)"/>
  <rect width="${w}" height="${h}" fill="url(#b)"/>
</svg>`);

// --- default Open Graph card ------------------------------------------------
{
  const logo = await sharp(LOGO).resize({ width: 880 }).png().toBuffer();
  const buf = await sharp(bg(1200, 630))
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await out('public/og-default.png', buf);
}

// --- favicon ----------------------------------------------------------------
{
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff5a4a"/>
      <stop offset="48%" stop-color="#f80000"/>
      <stop offset="100%" stop-color="#a00000"/>
    </linearGradient>
    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="52%" stop-color="#8090a0"/>
      <stop offset="100%" stop-color="#e4e9ef"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="13" fill="#06080c"/>
  <path d="M11 49V15h8.6l12.1 19.3V15h8.1v34h-8.4L19.1 29.6V49z" fill="url(#g)"/>
  <path d="M44.5 49V15h8.2v34z" fill="url(#c)"/>
</svg>`;
  await out('public/favicon.svg', Buffer.from(svg));
  await out('public/apple-touch-icon.png', await sharp(Buffer.from(svg)).resize(180, 180).png().toBuffer());
  await out('public/icon-512.png', await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer());
}

// --- placeholder art for seed content ---------------------------------------
const placeholder = async (path, w, h, label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#11161f"/><stop offset="50%" stop-color="#1a212c"/><stop offset="100%" stop-color="#0b0f15"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="#273040" stroke-width="2" rx="8"/>
</svg>`;
  await out(path, await sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer());
  return label;
};

await placeholder('src/content/games/images/placeholder-cover.webp', 800, 1200);
await placeholder('src/content/games/images/placeholder-shot-1.webp', 1280, 720);
await placeholder('src/content/games/images/placeholder-shot-2.webp', 1280, 720);
await placeholder('src/content/emulators/images/placeholder-logo.webp', 512, 512);
await placeholder('src/content/homebrew/images/placeholder-cover.webp', 800, 800);
await placeholder('src/content/authors/images/placeholder-avatar.webp', 256, 256);

console.log('\nAssets generated.');
