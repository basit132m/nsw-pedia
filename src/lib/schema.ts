import type { CollectionEntry } from 'astro:content';
import { SITE, abs } from './site';

type Json = Record<string, unknown>;

const clean = (o: Json): Json =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)),
  );

export const ORG_ID = abs('/#organization');
export const SITE_ID = abs('/#website');

export function organizationSchema(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { '@type': 'ImageObject', url: abs('/logo.webp'), width: 1500, height: 289 },
    description: SITE.description,
  };
}

export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': ORG_ID },
    inLanguage: SITE.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: abs('/search/?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(crumbs: { name: string; href: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]): Json | undefined {
  if (!items.length) return undefined;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function personSchema(author: CollectionEntry<'authors'>): Json {
  return clean({
    '@type': 'Person',
    '@id': abs(`/authors/${author.id}/#person`),
    name: author.data.name,
    jobTitle: author.data.role,
    description: author.data.bio,
    url: abs(`/authors/${author.id}/`),
    sameAs: author.data.sameAs,
  });
}

/**
 * VideoGame extends CreativeWork via Game, and SoftwareApplication supplies the
 * technical properties — so nearly every field in the NSWPEDIA info table has a
 * native mapping. Title ID and Build ID ride as PropertyValue identifiers.
 */
export function videoGameSchema(
  game: CollectionEntry<'games'>,
  opts: { url: string; publisherName: string; author: CollectionEntry<'authors'>; coverUrl: string },
): Json {
  const d = game.data;
  const identifiers: Json[] = [
    { '@type': 'PropertyValue', propertyID: 'Title ID', value: d.titleId },
  ];
  if (d.buildId) identifiers.push({ '@type': 'PropertyValue', propertyID: 'Build ID', value: d.buildId });

  const contentRating = [d.ageRatings.esrb && `ESRB ${d.ageRatings.esrb}`, d.ageRatings.pegi && `PEGI ${d.ageRatings.pegi}`, d.ageRatings.cero && `CERO ${d.ageRatings.cero}`]
    .filter(Boolean)
    .join(', ');

  const sameAs = [d.wikidataId ? `https://www.wikidata.org/wiki/${d.wikidataId}` : undefined, d.eshopUrl].filter(
    Boolean,
  ) as string[];

  return clean({
    '@type': 'VideoGame',
    '@id': `${opts.url}#game`,
    name: d.title,
    alternateName: d.alternateTitles,
    description: d.summary,
    url: opts.url,
    image: opts.coverUrl,
    genre: d.genres,
    gamePlatform: 'Nintendo Switch',
    operatingSystem: 'Nintendo Switch',
    applicationCategory: 'Game',
    datePublished: d.releaseDate.toISOString().slice(0, 10),
    softwareVersion: d.version,
    fileSize: d.fileSize,
    encodingFormat: d.fileType,
    softwareRequirements: `Firmware ${d.requiredFirmware} or later`,
    identifier: identifiers,
    inLanguage: Array.from(new Set([...d.languages.audio, ...d.languages.subtitles])),
    contentRating: contentRating || undefined,
    author: { '@type': 'Organization', name: d.developer },
    publisher: { '@type': 'Organization', name: opts.publisherName },
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: Math.max(d.players.offline, d.players.online, d.players.localCoop) },
    playMode: d.playModes.map((m) => (m === 'Handheld' ? 'SinglePlayer' : m)),
    sameAs,
    isPartOf: d.series ? { '@type': 'CreativeWorkSeries', name: d.series } : undefined,
    aggregateRating:
      d.rating.metacritic !== undefined
        ? { '@type': 'AggregateRating', ratingValue: d.rating.metacritic, bestRating: 100, ratingCount: 1 }
        : undefined,
    review: {
      '@type': 'Review',
      author: { '@id': abs(`/authors/${opts.author.id}/#person`) },
      datePublished: d.updatedAt.toISOString().slice(0, 10),
      reviewBody: d.summary,
    },
    dateModified: d.updatedAt.toISOString().slice(0, 10),
  });
}

export function softwareApplicationSchema(
  emu: CollectionEntry<'emulators'>,
  opts: { url: string; logoUrl: string },
): Json {
  const d = emu.data;
  return clean({
    '@type': 'SoftwareApplication',
    '@id': `${opts.url}#software`,
    name: d.title,
    description: d.summary,
    url: opts.url,
    image: opts.logoUrl,
    applicationCategory: 'GameApplication',
    operatingSystem: d.platforms.join(', '),
    softwareVersion: d.latestVersion,
    license: d.license,
    processorRequirements: d.requirements?.cpu,
    memoryRequirements: d.requirements?.ram,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    sameAs: [d.officialUrl, d.sourceUrl].filter(Boolean),
    dateModified: d.updatedAt.toISOString().slice(0, 10),
  });
}

export function articleSchema(
  entry: CollectionEntry<'guides'>,
  opts: { url: string; author: CollectionEntry<'authors'>; imageUrl?: string },
): Json {
  return clean({
    '@type': 'Article',
    '@id': `${opts.url}#article`,
    headline: entry.data.title,
    description: entry.data.summary,
    url: opts.url,
    image: opts.imageUrl,
    datePublished: entry.data.publishedAt.toISOString(),
    dateModified: entry.data.updatedAt.toISOString(),
    author: { '@id': abs(`/authors/${opts.author.id}/#person`) },
    publisher: { '@id': ORG_ID },
    isAccessibleForFree: true,
    inLanguage: SITE.locale,
  });
}

/** Wraps any set of nodes into one @graph — one script tag per page. */
export function graph(...nodes: (Json | undefined)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  });
}
