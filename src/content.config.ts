import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const TITLE_ID = /^[0-9A-F]{16}$/;

/** A single tested row in a game's emulator compatibility matrix. */
const compatRow = z.object({
  emulator: reference('emulators'),
  platform: z.enum(['Windows', 'Linux', 'macOS', 'Android', 'Steam Deck', 'ROG Ally']),
  device: z.string(),
  fps: z.string(),
  status: z.enum(['Perfect', 'Playable', 'Ingame', 'Menus', 'Boots', 'Nothing']),
  notes: z.string().optional(),
  testedOn: z.coerce.date(),
  testedBy: reference('authors'),
});

const versionRow = z.object({
  version: z.string(),
  date: z.coerce.date(),
  notes: z.string(),
  fileSize: z.string().optional(),
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
      trailerId: z.string().optional(),

      // --- catalogue ------------------------------------------------
      genres: z.array(z.string()).min(1),
      developer: z.string(),
      publisher: reference('publishers'),
      series: z.string().optional(),
      releaseDate: z.coerce.date(),

      // --- the technical block (NSWPEDIA's differentiator) ----------
      titleId: z.string().regex(TITLE_ID, 'Title ID must be 16 uppercase hex characters'),
      buildId: z.string().optional(),
      version: z.string(),
      fileSize: z.string(),
      fileType: z.enum(['NSP', 'XCI', 'NSZ', 'XCZ']),
      trimmed: z.boolean().default(false),
      requiredFirmware: z.string(),
      region: z.enum(['USA', 'EUR', 'JPN', 'ASIA', 'World', 'Multi']),
      contentType: z.enum(['Base game', 'Update', 'DLC']).default('Base game'),
      includedUpdate: z.string().optional(),
      dlcCount: z.number().int().nonnegative().default(0),
      checksums: z.object({ sha256: z.string().optional(), crc32: z.string().optional() }).default({}),

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
        esrb: z.string().optional(),
        pegi: z.string().optional(),
        cero: z.string().optional(),
      }).default({}),

      // --- original research ----------------------------------------
      emulatorCompat: z.array(compatRow).min(3, 'A game page needs at least 3 tested compatibility rows'),
      deviceTiers: z.array(z.object({ tier: z.string(), device: z.string(), result: z.string() })).default([]),
      knownIssues: z.array(z.string()).default([]),
      versionHistory: z.array(versionRow).default([]),
      faq: z.array(faqItem).default([]),

      // --- linking & provenance --------------------------------------
      relatedGames: z.array(reference('games')).default([]),
      eshopUrl: z.string().url().optional(),
      wikidataId: z.string().optional(),
      igdbId: z.number().optional(),
      rating: z.object({ metacritic: z.number().optional(), userScore: z.number().optional() }).default({}),

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
      latestVersion: z.string().optional(),
      license: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      officialUrl: z.string().url().optional(),
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
      timeRequired: z.string().optional(),
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
      requiredFirmware: z.string().optional(),
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
      founded: z.string().optional(),
      country: z.string().optional(),
      website: z.string().url().optional(),
      wikidataId: z.string().optional(),
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
