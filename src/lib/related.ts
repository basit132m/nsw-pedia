import type { CollectionEntry } from 'astro:content';

type Game = CollectionEntry<'games'>;

/**
 * Build-time internal linking. Google reads internal links as topical signals,
 * so every game page earns contextual links instead of a generic "more games"
 * strip. Scoring: same series > same publisher > shared genres > release
 * proximity. Hand-picked relatedGames always rank first.
 */
export function relatedGames(current: Game, all: Game[], limit = 6): Game[] {
  const manual = new Set(current.data.relatedGames.map((r) => r.id));
  const pool = all.filter((g) => g.id !== current.id && !g.data.draft);

  const score = (g: Game): number => {
    let s = 0;
    if (manual.has(g.id)) s += 1000;
    if (current.data.series && g.data.series === current.data.series) s += 50;
    if (g.data.publisher && current.data.publisher && g.data.publisher.id === current.data.publisher.id) {
      s += 15;
    }
    const shared = g.data.genres.filter((x) => current.data.genres.includes(x)).length;
    s += shared * 10;
    if (g.data.releaseDate && current.data.releaseDate) {
      const years = Math.abs(g.data.releaseDate.getFullYear() - current.data.releaseDate.getFullYear());
      s += Math.max(0, 5 - years);
    }
    return s;
  };

  return pool
    .map((g) => ({ g, s: score(g) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.g.data.title.localeCompare(b.g.data.title))
    .slice(0, limit)
    .map((x) => x.g);
}
