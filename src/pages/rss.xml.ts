import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@lib/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const [games, guides] = await Promise.all([
    getCollection('games', ({ data }) => !data.draft),
    getCollection('guides', ({ data }) => !data.draft),
  ]);

  const items = [
    ...games.map((g) => ({
      title: g.data.title,
      description: g.data.summary,
      pubDate: g.data.updatedAt ?? g.data.publishedAt ?? new Date(),
      link: `/roms/${g.id}/`,
    })),
    ...guides.map((g) => ({
      title: g.data.title,
      description: g.data.summary,
      pubDate: g.data.updatedAt ?? g.data.publishedAt ?? new Date(),
      link: `/guides/${g.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>en-us</language>`,
  });
}
