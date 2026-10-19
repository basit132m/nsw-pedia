import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { abs } from './site';

/**
 * Sitemap data, built from the content collections.
 *
 * Deliberately omits <changefreq> and <priority> is kept minimal: Google
 * ignores both. <lastmod> is the field search engines actually use, and only
 * while it stays honest — so it comes from each entry's own updatedAt /
 * publishedAt rather than the build time, which would mark every page as
 * freshly changed on every deploy.
 */
export interface SitemapUrl {
  loc: string;
  lastmod?: Date;
  priority: number;
  images?: string[];
}

export interface SitemapSection {
  /** URL segment: /sitemap-<name>.xml */
  name: string;
  urls: SitemapUrl[];
}

type Dated = { updatedAt?: Date; publishedAt?: Date };
const when = (d: Dated) => d.updatedAt ?? d.publishedAt;

/** Drafts never ship; a page marked noindex must not be advertised either. */
const listed = <T extends { data: { draft?: boolean; seo?: { noindex?: boolean } } }>(e: T) =>
  !e.data.draft && !e.data.seo?.noindex;

const newest = (urls: SitemapUrl[]): Date | undefined => {
  const times = urls.map((u) => u.lastmod?.getTime()).filter((t): t is number => Boolean(t));
  return times.length ? new Date(Math.max(...times)) : undefined;
};

/** Cover art, emitted at one canonical width so the URL is real. */
async function coverUrl(entry: CollectionEntry<'games'>): Promise<string[]> {
  const out: string[] = [];
  for (const img of [entry.data.cover, entry.data.banner]) {
    if (!img) continue;
    const built = await getImage({ src: img, width: Math.min(img.width, 1200), format: 'webp' });
    out.push(abs(built.src));
  }
  return out;
}

export async function buildSections(): Promise<SitemapSection[]> {
  const [games, emulators, guides, homebrew, publishers, authors] = await Promise.all([
    getCollection('games', listed),
    getCollection('emulators', listed),
    getCollection('guides', listed),
    getCollection('homebrew', listed),
    getCollection('publishers'),
    getCollection('authors'),
  ]);

  const roms: SitemapUrl[] = await Promise.all(
    games.map(async (g) => ({
      loc: abs(`/roms/${g.id}/`),
      lastmod: when(g.data),
      priority: 0.8,
      images: await coverUrl(g),
    })),
  );

  // Section landing pages carry the newest date of what they list, so a new
  // entry marks its index as changed too.
  const pages: SitemapUrl[] = [
    { loc: abs('/'), priority: 1.0, lastmod: newest(roms) },
    { loc: abs('/roms/'), priority: 0.8, lastmod: newest(roms) },
    { loc: abs('/emulators/'), priority: 0.8, lastmod: newest(emulators.map((e) => ({ loc: '', priority: 0, lastmod: when(e.data) }))) },
    { loc: abs('/guides/'), priority: 0.8, lastmod: newest(guides.map((e) => ({ loc: '', priority: 0, lastmod: when(e.data) }))) },
    { loc: abs('/homebrew/'), priority: 0.8, lastmod: newest(homebrew.map((e) => ({ loc: '', priority: 0, lastmod: when(e.data) }))) },
    { loc: abs('/about/'), priority: 0.3 },
    { loc: abs('/methodology/'), priority: 0.4 },
    { loc: abs('/legal/'), priority: 0.3 },
    { loc: abs('/contact/'), priority: 0.3 },
  ];

  return [
    { name: 'pages', urls: pages },
    { name: 'roms', urls: roms },
    {
      name: 'emulators',
      urls: emulators.map((e) => ({ loc: abs(`/emulators/${e.id}/`), lastmod: when(e.data), priority: 0.7 })),
    },
    {
      name: 'guides',
      urls: guides.map((e) => ({ loc: abs(`/guides/${e.id}/`), lastmod: when(e.data), priority: 0.7 })),
    },
    {
      name: 'homebrew',
      urls: homebrew.map((e) => ({ loc: abs(`/homebrew/${e.id}/`), lastmod: when(e.data), priority: 0.6 })),
    },
    {
      name: 'taxonomy',
      urls: [
        ...publishers.map((e) => ({ loc: abs(`/publishers/${e.id}/`), priority: 0.4 })),
        ...authors.map((e) => ({ loc: abs(`/authors/${e.id}/`), priority: 0.4 })),
      ],
    },
  ].filter((s) => s.urls.length > 0);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function renderUrlset(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${esc(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${iso(u.lastmod)}</lastmod>`);
      parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      for (const img of u.images ?? []) {
        parts.push(`    <image:image><image:loc>${esc(img)}</image:loc></image:image>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

export function renderIndex(sections: SitemapSection[]): string {
  const body = sections
    .map((s) => {
      const last = newest(s.urls);
      return [
        '  <sitemap>',
        `    <loc>${esc(abs(`/sitemap-${s.name}.xml`))}</loc>`,
        last ? `    <lastmod>${iso(last)}</lastmod>` : undefined,
        '  </sitemap>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}
