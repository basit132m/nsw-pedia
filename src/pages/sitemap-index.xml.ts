import { buildSections, renderIndex } from '@lib/sitemap';

/** The one URL to submit to Search Console; it points at the rest. */
export async function GET() {
  return new Response(renderIndex(await buildSections()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
