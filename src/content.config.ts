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
const optBool = (fallback = false) =>
  z.preprocess(blankToUndefined, z.boolean().default(fallback));

/**
 * Lists and groups cleared in the editor are written as `null`, not omitted,
 * so these treat null as absent and fall back to the empty default.
 */
const optArr = <T extends z.ZodTypeAny>(inner: T) =>
  z.preprocess(blankToUndefined, z.array(inner).default([]));
const optObj = <T extends z.ZodRawShape>(shape: T) =>
  z.preprocess(blankToUndefined, z.object(shape).default({}));
const optRef = <C extends string>(collection: C) =>
  z.preprocess(blankToUndefined, reference(collection).optional());

/**
 * Per-page SEO overrides. Every field is optional: leave one blank and the
 * template derives a sensible value. Fill one in to take manual control.
 */
const seoBlock = optObj({
  metaTitle: optStr(),
  metaDescription: optStr(),
  keywords: optArr(z.string()),
  noindex: optBool(false),
});

/**
 * A row in a game's emulator compatibility matrix. `source` records whether a
 * result is first-party ('tested') or taken from a community database
 * ('reported'); the table shows the distinction and links reported rows to
 * their source. Every field is optional so a partial row still publishes.
 */
const compatRow = z.object({
  emulator: optRef('emulators'),
  platform: optEnum(['Windows', 'Linux', 'macOS', 'Android', 'Steam Deck', 'ROG Ally']),
  device: optStr(),
  fps: optStr(),
  status: optEnum(['Perfect', 'Playable', 'Ingame', 'Menus', 'Boots', 'Nothing']),
  notes: optStr(),
  source: optEnum(['tested', 'reported']),
  sourceUrl: optUrl(),
  testedOn: optDate(),
  testedBy: optRef('authors'),
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
      alternateTitles: optArr(z.string()),
      summary: optStr(),
      cover: image().optional(),
      banner: image().optional(),
      screenshots: optArr(z.object({ src: image(), alt: optStr() })),
      trailerId: optStr(),

      // --- catalogue ------------------------------------------------
      genres: optArr(z.string()),
      developer: optStr(),
      publisher: optRef('publishers'),
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
      trimmed: optBool(false),
      requiredFirmware: optStr(),
      region: optEnum(['USA', 'EUR', 'JPN', 'ASIA', 'World', 'Multi']),
      contentType: optEnum(['Base game', 'Update', 'DLC']),
      includedUpdate: optStr(),
      dlcCount: optNum(),
      checksums: optObj({ sha256: optStr(), crc32: optStr() }),

      languages: optObj({
        audio: optArr(z.string()),
        subtitles: optArr(z.string()),
      }),

      // --- play ------------------------------------------------------
      players: optObj({
        offline: optNum(),
        localCoop: optNum(),
        online: optNum(),
        nsoRequired: optBool(false),
      }),
      playModes: optArr(z.enum(['TV', 'Tabletop', 'Handheld'])),
      features: optArr(z.string()),
      ageRatings: optObj({ esrb: optStr(), pegi: optStr(), cero: optStr() }),

      // --- research ---------------------------------------------------
      emulatorCompat: optArr(compatRow),
      deviceTiers: z
        .array(z.object({ tier: optStr(), device: optStr(), result: optStr() }))
        .default([]),
      knownIssues: optArr(z.string()),
      versionHistory: optArr(versionRow),
      faq: optArr(faqItem),

      // --- linking & provenance ---------------------------------------
      relatedGames: optArr(reference('games')),
      eshopUrl: optUrl(),
      wikidataId: optStr(),
      igdbId: optNum(),
      rating: optObj({ metacritic: optNum(), userScore: optNum() }),

      seo: seoBlock,
      author: optRef('authors'),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: optBool(false),
    }),
});

const emulators = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/emulators' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: optStr(),
      logo: image().optional(),
      platforms: optArr(z.string()),
      latestVersion: optStr(),
      license: optStr(),
      sourceUrl: optUrl(),
      officialUrl: optUrl(),
      status: optEnum(['Active', 'Maintenance only', 'Discontinued', 'Fork']),
      requirements: optObj({ cpu: optStr(), gpu: optStr(), ram: optStr() }),
      pros: optArr(z.string()),
      cons: optArr(z.string()),
      faq: optArr(faqItem),
      seo: seoBlock,
      author: optRef('authors'),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: optBool(false),
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
      tags: optArr(z.string()),
      faq: optArr(faqItem),
      seo: seoBlock,
      author: optRef('authors'),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: optBool(false),
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
      genres: optArr(z.string()),
      faq: optArr(faqItem),
      seo: seoBlock,
      author: optRef('authors'),
      publishedAt: optDate(),
      updatedAt: optDate(),
      draft: optBool(false),
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
      testingRig: optArr(z.string()),
      sameAs: optArr(z.string()),
    }),
});

export const collections = { games, emulators, guides, homebrew, publishers, authors };
