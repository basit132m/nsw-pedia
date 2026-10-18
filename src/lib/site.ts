export const SITE = {
  name: 'NSWPEDIA',
  url: 'https://nsw-pedia.com',
  title: 'NSWPEDIA — Nintendo Switch Game Database, Emulation Guides & Homebrew',
  description:
    'The Nintendo Switch reference: a full game database with Title IDs, firmware requirements and file details, hands-on emulator compatibility testing, setup guides and legal homebrew downloads.',
  tagline: 'The Nintendo Switch database, tested.',
  locale: 'en',
  twitter: '@nswpedia',
  themeColor: '#06080c',
} as const;

export const NAV = [
  { href: '/games/', label: 'Games' },
  { href: '/emulators/', label: 'Emulators' },
  { href: '/guides/', label: 'Guides' },
  { href: '/homebrew/', label: 'Homebrew' },
] as const;

export const FOOTER_LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/methodology/', label: 'How we test' },
  { href: '/legal/', label: 'Legal & DMCA' },
  { href: '/contact/', label: 'Contact' },
] as const;

/** Absolute URL helper — every canonical and JSON-LD id runs through this. */
export function abs(path: string): string {
  return new URL(path, SITE.url).href;
}
