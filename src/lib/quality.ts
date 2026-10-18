/**
 * Content quality reporting.
 *
 * Thin pages are what Google's helpful-content system demotes, so the build
 * flags any page with little original copy. It warns rather than fails: a
 * page can go live incomplete and be filled in later.
 */
const MIN_WORDS = 250;

export function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>\-|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

export function checkQuality(id: string, body: string | undefined, draft = false): void {
  if (draft) return;
  const words = countWords(body ?? '');
  if (words < MIN_WORDS) {
    console.warn(
      `  [thin page] ${id} — ${words} words of original copy (${MIN_WORDS} recommended). ` +
        `It will still publish.`,
    );
  }
}
