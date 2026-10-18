/**
 * The quality floor. Thin programmatic pages are what Google's helpful-content
 * system demotes, so a page that fails these checks fails the build instead of
 * quietly shipping. Schema-level rules (cover image, >=3 compatibility rows)
 * live in content.config.ts; this covers what Zod cannot see — the prose.
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

export function assertQualityFloor(id: string, body: string | undefined, draft = false): void {
  if (draft) return;
  const words = countWords(body ?? '');
  if (words < MIN_WORDS) {
    throw new Error(
      `[quality floor] "${id}" has ${words} words of original copy; ${MIN_WORDS} required. ` +
        `Expand it, or set draft: true to keep it out of the build.`,
    );
  }
}
