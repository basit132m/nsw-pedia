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
| `node scripts/gen-assets.mjs && python3 scripts/gen-favicon-ico.py` | Regenerate OG card, favicons and placeholder art from `src/assets/` |

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

## Required fields

Only `title` is required, on every collection. Everything else is optional, so a page can be
published with whatever is known and completed later. The templates omit any row or section
with no data, so a sparse page renders cleanly rather than showing blank fields.

`lib/quality.ts` still warns in the build log for pages under 250 words of original prose,
because thin pages are what Google's helpful-content system demotes — but it is a warning,
not an error, and the page publishes either way.

## Page metadata

Each content type has an optional `seo` block:

| Field | Behaviour when blank |
|---|---|
| `metaTitle` | Derived from the title plus whichever fields are filled in |
| `metaDescription` | Falls back to `summary`, else a generated line from the technical fields; trimmed to 155 characters |
| `keywords` | Derived from title, alternate titles, genres, publisher and developer |
| `noindex` | `false` |

A hand-written `metaTitle` is used **verbatim** — no ` | NSWPEDIA` suffix — so the author
controls the exact length shown in a search result. A hand-written `metaDescription` is also
used verbatim; only generated descriptions are truncated.

Meta keywords are supported because they were asked for. Google has ignored them since 2009
and they are not a ranking factor there; a few smaller engines still read them.

## Adding a game

There are two ways: the admin panel at `/admin/` (a form UI — see [SETUP.md](./SETUP.md)),
or by hand:

1. Create `src/content/games/<slug>.md`. The slug becomes the URL: `/roms/<slug>/`.
   (The collection folder is still named `games`; only the public URL is `/roms/`.)
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
