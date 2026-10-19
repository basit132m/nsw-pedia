import type { APIContext } from 'astro';
import { buildSections, renderUrlset, type SitemapSection } from '@lib/sitemap';

export async function getStaticPaths() {
  const sections = await buildSections();
  return sections.map((section) => ({ params: { section: section.name }, props: { section } }));
}

export function GET({ props }: APIContext & { props: { section: SitemapSection } }) {
  return new Response(renderUrlset(props.section.urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
