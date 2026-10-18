import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const TITLE_ID = /^[0-9A-F]{16}$/;

/**
 * The CMS writes an empty string when an optional field is left blank, which
 * would fail .url() validation or leave "" in the rendered output. These
 * coerce blank to undefined so a cleared field behaves as absent.
 */
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optStr = () => z.preprocess(blankToUndefined, z.string().optional());
const optUrl = () => z.preprocess(blankToUndefined, z.string().url().optional());
const optNum = () => z.preprocess(blankToUndefined, z.number().optional());

/**
 * A single row in a game's emulator compatibility matrix.
 *
 * `source` keeps the page honest about where a result came from:
 *   - 'tested'   we ran the game ourselves; requires a named tester.
 *   - 'reported' sourced from a community database; requires a link.
 * The refine below enforces that, so a row can never claim first-hand
 * testing without naming who did it.
 */
const compatRow = z
  .object({
    emulator: reference('emulators'),
    platform: z.enum(['Windows', 'Linux', 'macOS', 'Android', 'Steam Deck', 'ROG Ally']),
    device: z.string(),
    fps: z.string(),
    status: z.enum(['Perfect', 'Playable', 'Ingame', 'Menus', 'Boots', 'Nothing']),
    notes: optStr(),
    source: z.enum(['tested', 'reported']).default('reported'),
    sourceUrl: optUrl(),
    testedOn: z.coerce.date(),
    testedBy: reference('authors').optional(),
  })
  .refine((r) => (r.source === 'tested' ? !!r.testedBy : !!r.sourceUrl), {
    message:
      "A 'tested' row needs testedBy (who ran it); a 'reported' row needs sourceUrl (where it came from).",
  });

const versionRow = z.object({
  version: z.string(),
  date: z.coerce.date(),
  notes: z.string(),
  fileSize: optStr(),
});

const faqItem = z.object({ question: z.string(), answer: z.string() });

const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      // --- identity -------------------------------------------------
      title: z.string(),
      alternateTitles: z.array(z.string()).default([]),
      summary: z.string().min(50).max(300),
      cover: image(),
      banner: image().optional(),
      screenshots: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      trailerId: optStr(),

      // --- catalogue ------------------------------------------------
      genres: z.array(z.string()).min(1),
      developer: z.string(),
      publisher: reference('publishers'),
      series: optStr(),
      releaseDate: z.coerce.date(),

      // --- the technical block (NSWPEDIA's differentiator) ----------
      titleId: z.string().regex(TITLE_ID, 'Title ID must be 16 uppercase hex characters'),
      buildId: optStr(),
      version: z.string(),
      fileSize: z.string(),
      fileType: z.enum(['NSP', 'XCI', 'NSZ', 'XCZ']),
      trimmed: z.boolean().default(false),
      requiredFirmware: z.string(),
      region: z.enum(['USA', 'EUR', 'JPN', 'ASIA', 'World', 'Multi']),
      contentType: z.enum(['Base game', 'Update', 'DLC']).default('Base game'),
      includedUpdate: optStr(),
      dlcCount: z.number().int().nonnegative().default(0),
      checksums: z.object({ sha256: optStr(), crc32: optStr() }).default({}),

      languages: z.object({
        audio: z.array(z.string()).default([]),
        subtitles: z.array(z.string()).min(1),
      }),

      // --- play ------------------------------------------------------
      players: z.object({
        offline: z.number().int().positive(),
        localCoop: z.number().int().nonnegative().default(0),
        online: z.number().int().nonnegative().default(0),
        nsoRequired: z.boolean().default(false),
      }),
      playModes: z.array(z.enum(['TV', 'Tabletop', 'Handheld'])).min(1),
      features: z.array(z.string()).default([]),
      ageRatings: z.object({
        esrb: optStr(),
        pegi: optStr(),
        cero: optStr(),
      }).default({}),

      // --- original research ----------------------------------------
      emulatorCompat: z.array(compatRow).min(3, 'A game page needs at least 3 compatibility rows'),
      deviceTiers: z.array(z.object({ tier: z.string(), device: z.string(), result: z.string() })).default([]),
      knownIssues: z.array(z.string()).default([]),
      versionHistory: z.array(versionRow).default([]),
      faq: z.array(faqItem).default([]),

      // --- linking & provenance --------------------------------------
      relatedGames: z.array(reference('games')).default([]),
      eshopUrl: optUrl(),
      wikidataId: optStr(),
      igdbId: optNum(),
      rating: z.object({ metacritic: optNum(), userScore: optNum() }).default({}),

      author: reference('authors'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

const emulators = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/emulators' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().min(50).max(300),
      logo: image(),
      platforms: z.array(z.string()).min(1),
      latestVersion: optStr(),
      license: optStr(),
      sourceUrl: optUrl(),
      officialUrl: optUrl(),
      status: z.enum(['Active', 'Maintenance only', 'Discontinued', 'Fork']),
      requirements: z.object({ cpu: z.string(), gpu: z.string(), ram: z.string() }).optional(),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      author: reference('authors'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().min(50).max(300),
      cover: image().optional(),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
      timeRequired: optStr(),
      tags: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      author: reference('authors'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

/** Legal downloads only: homebrew and public-domain titles. */
const homebrew = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/homebrew' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().min(50).max(300),
      cover: image(),
      author_name: z.string(),
      license: z.string(),
      sourceUrl: z.string().url(),
      downloadUrl: z.string().url(),
      fileType: z.enum(['NRO', 'NSP', 'ZIP']),
      fileSize: z.string(),
      version: z.string(),
      requiredFirmware: optStr(),
      genres: z.array(z.string()).default([]),
      faq: z.array(faqItem).default([]),
      author: reference('authors'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

const publishers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publishers' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().min(30).max(300),
      logo: image().optional(),
      founded: optStr(),
      country: optStr(),
      website: optUrl(),
      wikidataId: optStr(),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string().min(80),
      avatar: image().optional(),
      testingRig: z.array(z.string()).default([]),
      sameAs: z.array(z.string().url()).default([]),
    }),
});

export const collections = { games, emulators, guides, homebrew, publishers, authors };
