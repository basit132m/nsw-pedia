import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const TITLE_ID = /^[0-9A-F]{16}$/;

/**
 * The CMS writes an empty string when a field is left blank, which would fail
 * validation or leave "" in the output. These coerce blank to undefined so an
 * unfilled field behaves as absent.
 */
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optStr = () => z.preprocess(blankToUndefined, z.string().optional());
const optUrl = () => z.preprocess(blankToUndefined, z.string().url().optional());
const optNum = () => z.preprocess(blankToUndefined, z.number().optional());
const optDate = () => z.preprocess(blankToUndefined, z.coerce.date().optional());
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(blankToUndefined, z.enum(values).optional());

/**
 * Per-page SEO overrides. Every field is optional: leave one blank and the
 * template derives a sensible value. Fill one in to take manual control.
 */
const seoBlock = z
  .object({
    metaTitle: optStr(),
    metaDescription: optStr(),
    keywords: z.array(z.string()).default([]),
    noindex: z.boolean().default(false),
  })
  .default({});

/**
 * A row in a game's emulator compatibility matrix. `source` records whether a
 * result is first-party ('tested') or taken from a community database
 * ('reported'); the table shows the distinction and links reported rows to
 * their source. Every field is optional so a partial row still publishes.
 */
const compatRow = z.object({
  emulator: reference('emulators').optional(),
  platform: optEnum(['Windows', 'Linux', 'macOS', 'Android', 'Steam Deck', 'ROG Ally']),
  device: optStr(),
  fps: optStr(),
  status: optEnum(['Perfect', 'Playable', 'Ingame', 'Menus', 'Boots', 'Nothing']),
  notes: optStr(),
  source: optEnum(['tested', 'reported']),
  sourceUrl: optUrl(),
  testedOn: optDate(),
  testedBy: reference('authors').optional(),
});

const versionRow = z.object({
  version: optStr(),
  date: optDate(),
  notes: optStr(),
  fileSize: optStr(),
});

const faqItem = z.object({ question: optStr(), answer: optStr() });

/**
 * Games. Only `title` is required — a page can be published with whatever is
 * known and filled in later. The template omits any row or section with no
 * data, so a sparse page renders cleanly rather than showing empty fields.
 */
const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      // --- identity -------------------------------------------------
      title: z.string(),
      alternateTitles: z.array(z.string()).default([]),
      summary: optStr(),
      cover: image().optional(),
      banner: image().optional(),
      screenshots: z.array(z.object({ src: image(), alt: optStr() })).default([]),
      trailerId: optStr(),

      // --- catalogue ------------------------------------------------
      genres: z.array(z.string()).default([]),
      developer: optStr(),
      publisher: reference('publishers').optional(),
      series: optStr(),
      releaseDate: optDate(),

      // --- technical block ------------------------------------------
      titleId: z.preprocess(
        blankToUndefined,
        z.string().regex(TITLE_ID, 'Title ID must be 16 uppercase hex characters').optional(),
      ),
      buildId: optStr(),
      version: optStr(),
      fileSize: optStr(),
      fileType: optEnum(['NSP', 'XCI', 'NSZ', 'XCZ']),
      trimmed: z.boolean().default(false),
      requiredFirmware: optStr(),
      region: optEnum(['USA', 'EUR', 'JPN', 'ASIA', 'World', 'Multi']),
      contentType: optEnum(['Base game', 'Update', 'DLC']),
      includedUpdate: optStr(),
      dlcCount: optNum(),
      checksums: z.object({ sha256: optStr(), crc32: optStr() }).default({}),

      languages: z
        .object({
          audio: z.array(z.string()).default([]),
          subtitles: z.array(z.string()).default([]),
        })
        .default({}),

      // --- play ------------------------------------------------------
      players: z
        .object({
          offline: optNum(),
          localCoop: optNum(),
          online: optNum(),
          nsoRequired: z.boolean().default(false),
        })
        .default({}),
      playModes: z.array(z.enum(['TV', 'Tabletop', 'Handheld'])).default([]),
      features: z.array(z.string()).default([]),
      ageRatings: z.object({ esrb: optStr(), pegi: optStr(), cero: optStr() }).default({}),

      // --- research ---------------------------------------------------
      emulatorCompat: z.array(compatRow).default([]),
      deviceTiers: z
        .array(z.object({ tier: optStr(), device: optStr(), result: optStr() }))
        .default([]),
      knownIssues: z.array(z.string()).default([]),
      versionHistory: z.array(versionRow).default([]),
      faq: z.array(faqItem).default([]),

      // --- linking & provenance ---------------------------------------
      relatedGames: z.array(reference('games')).default([]),
      eshopUrl: optUrl(),
      wikidataId: optStr(),
      igdbId: optNum(),
      rating: z.object({ metacritic: optNum(), userScore: optNum() }).default({}),

      seo: seoBlock,
      author: reference('authors').optional(),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: z.boolean().default(false),
    }),
});

const emulators = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/emulators' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: optStr(),
      logo: image().optional(),
      platforms: z.array(z.string()).default([]),
      latestVersion: optStr(),
      license: optStr(),
      sourceUrl: optUrl(),
      officialUrl: optUrl(),
      status: optEnum(['Active', 'Maintenance only', 'Discontinued', 'Fork']),
      requirements: z.object({ cpu: optStr(), gpu: optStr(), ram: optStr() }).default({}),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      seo: seoBlock,
      author: reference('authors').optional(),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: z.boolean().default(false),
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: optStr(),
      cover: image().optional(),
      difficulty: optEnum(['Beginner', 'Intermediate', 'Advanced']),
      timeRequired: optStr(),
      tags: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      seo: seoBlock,
      author: reference('authors').optional(),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: z.boolean().default(false),
    }),
});

/** Legal downloads only: homebrew and public-domain titles. */
const homebrew = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/homebrew' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: optStr(),
      cover: image().optional(),
      author_name: optStr(),
      license: optStr(),
      sourceUrl: optUrl(),
      downloadUrl: optUrl(),
      fileType: optEnum(['NRO', 'NSP', 'ZIP']),
      fileSize: optStr(),
      version: optStr(),
      requiredFirmware: optStr(),
      genres: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      seo: seoBlock,
      author: reference('authors').optional(),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: z.boolean().default(false),
    }),
});

const publishers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publishers' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: optStr(),
      logo: image().optional(),
      founded: optStr(),
      country: optStr(),
      website: optUrl(),
      wikidataId: optStr(),
      seo: seoBlock,
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: optStr(),
      bio: optStr(),
      avatar: image().optional(),
      testingRig: z.array(z.string()).default([]),
      sameAs: z.array(z.string()).default([]),
    }),
});

export const collections = { games, emulators, guides, homebrew, publishers, authors };
