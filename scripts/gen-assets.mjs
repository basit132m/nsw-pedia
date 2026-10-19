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

// --- favicons ---------------------------------------------------------------
// The brand icon is a detailed mark: console, swoosh and wordmark. At 16px the
// wordmark is unreadable, so tab icons are cropped to the console body, whose
// red/blue Joy-Con split still reads at that size. Larger icons, where there
// is room for it, use the whole mark.
{
  const SRC = 'src/assets/brand-icon.webp';
  const CONSOLE = { left: 250, top: 60, width: 880, height: 770 };

  // Square the console crop with transparent padding so nothing is cut off.
  const side = Math.max(CONSOLE.width, CONSOLE.height);
  const consoleSquare = await sharp(SRC)
    .extract(CONSOLE)
    .extend({
      top: Math.round((side - CONSOLE.height) / 2),
      bottom: side - CONSOLE.height - Math.round((side - CONSOLE.height) / 2),
      left: Math.round((side - CONSOLE.width) / 2),
      right: side - CONSOLE.width - Math.round((side - CONSOLE.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  for (const size of [16, 32, 48, 96]) {
    await out(
      `public/favicon-${size}.png`,
      await sharp(consoleSquare).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
    );
  }

  // sharp cannot write ICO, and a PNG named .ico is a container mismatch that
  // some crawlers reject. The real multi-size ICO is built by
  // scripts/gen-favicon-ico.py, which this calls.
  await out('public/favicon-ico-source.png', await sharp(consoleSquare).resize(256, 256).png().toBuffer());

  // Home-screen icons use the full mark. iOS flattens transparency to black,
  // so it gets the site background and a little breathing room.
  const padded = async (size, bg) => {
    const inner = Math.round(size * 0.88);
    const mark = await sharp(SRC).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    return sharp({
      create: { width: size, height: size, channels: 4, background: bg },
    })
      .composite([{ input: mark, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  };
  await out('public/apple-touch-icon.png', await padded(180, { r: 11, g: 15, b: 21, alpha: 1 }));
  await out('public/icon-192.png', await padded(192, { r: 0, g: 0, b: 0, alpha: 0 }));
  await out('public/icon-512.png', await padded(512, { r: 0, g: 0, b: 0, alpha: 0 }));
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
