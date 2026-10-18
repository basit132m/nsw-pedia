# NSWPEDIA

Nintendo Switch reference site: a structured game database, hands-on emulator compatibility
testing, setup guides and a homebrew library.

Built with [Astro](https://astro.build) as a fully static site. No JavaScript framework ships
to the browser — the only client-side script is Astro's ~2 KB prefetcher.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on http://localhost:4321 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | TypeScript + Astro diagnostics |
| `node scripts/gen-assets.mjs` | Regenerate OG card, favicons and placeholder art |

## Project structure

```
src/
  content.config.ts      Zod schemas for every content type — the single source of truth
  content/
    games/               One Markdown file per game (the technical block lives in frontmatter)
    emulators/           Emulator profiles
    guides/              How-tos and reference articles
    homebrew/            Legal downloads only
    publishers/          Publisher entity hubs
    authors/             Author profiles (E-E-A-T)
  lib/
    site.ts              Site constants and nav
    schema.ts            JSON-LD builders (VideoGame, SoftwareApplication, FAQPage, …)
    quality.ts           The quality floor — fails the build on thin pages
    related.ts           Build-time internal linking engine
  components/            UI pieces (info table, compatibility matrix, version history, FAQ)
  layouts/BaseLayout.astro
  pages/                 Routes
scripts/gen-assets.mjs   Brand asset generation
```

## The quality floor

Thin programmatic pages are what Google's helpful-content system demotes, so the build
enforces a minimum standard rather than trusting discipline:

- **In `content.config.ts`** — a game needs a cover image, at least three tested compatibility
  rows, a valid 16-character hex Title ID, a summary between 50 and 300 characters, and a
  publisher and author that resolve to real entities.
- **In `lib/quality.ts`** — a page needs at least 250 words of original prose in its body.

A page that fails either check **fails the build**. Set `draft: true` to park it instead.

## Adding a game

1. Create `src/content/games/<slug>.md`. The slug becomes the URL: `/games/<slug>/`.
2. Fill in the frontmatter. TypeScript will tell you what is missing — run `npm run check`.
3. Put the cover in `src/content/games/images/` and reference it relatively (`./images/x.webp`).
4. Write at least 250 words of original copy in the body.
5. `npm run build`. If it builds, the page meets the floor.

## SEO architecture

- **Structured data** — every page emits one `@graph` containing `Organization`, `WebSite`,
  `BreadcrumbList` and the page-specific node. Game pages add `VideoGame` (with Title ID and
  Build ID as `PropertyValue` identifiers, plus `fileSize`, `encodingFormat`,
  `softwareVersion` and `softwareRequirements`) and `FAQPage` where FAQs exist.
- **Entity linking** — `sameAs` points at Wikidata and official store listings so Google can
  resolve our pages to known entities instead of treating them as orphan text.
- **Internal linking** — `lib/related.ts` scores every other game at build time (same series >
  same publisher > shared genres > release proximity) so each page earns contextual links.
- **Crawl control** — split sitemap with per-type priorities, `robots.txt` blocking query
  strings, canonical on every page, `llms.txt` for AI search engines.
- **Performance** — static HTML, self-hosted variable fonts, build-time image optimisation to
  WebP, and a Lighthouse budget in CI that fails the build if performance drops below 95 or
  LCP exceeds 2s.

## Deployment

Pushes to `main` build and deploy to Cloudflare Pages via `.github/workflows/deploy.yml`.
See [SETUP.md](./SETUP.md) for first-time configuration.

## What this site does not publish

No commercial game files, no system firmware, no encryption keys. The homebrew section carries
only software licensed for redistribution, linked to the upstream project's own release page.
