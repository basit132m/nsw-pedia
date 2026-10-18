/**
 * Page metadata. Every value can be set by hand per page; when it is left
 * blank the template derives one. Manual always wins.
 */

/** Google renders roughly 155 characters of a description before truncating. */
export const DESCRIPTION_LIMIT = 155;
/** Roughly 60 characters of a title survive in a desktop result. */
export const TITLE_LIMIT = 60;

export function truncate(text: string, max = DESCRIPTION_LIMIT): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '') + '…';
}

export function resolveTitle(manual: string | undefined, derived: string): string {
  return manual?.trim() || derived;
}

export function resolveDescription(manual: string | undefined, derived: string): string {
  // A hand-written description is used verbatim: if the author wants it long,
  // that is their call. Only derived text is trimmed to fit a search result.
  const m = manual?.trim();
  return m || truncate(derived);
}

/**
 * Builds the meta keywords string. Manual keywords win; otherwise they are
 * derived from the page's own fields. Deduplicated, capped at 12.
 *
 * Note: Google has ignored meta keywords since 2009 and it is not a ranking
 * factor there. It is supported because some smaller engines still read it.
 */
export function resolveKeywords(
  manual: string[] | undefined,
  derived: (string | undefined | false)[],
): string | undefined {
  const source = manual?.length ? manual : derived;
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of source) {
    if (!raw) continue;
    const value = String(raw).trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length === 12) break;
  }
  return out.length ? out.join(', ') : undefined;
}
