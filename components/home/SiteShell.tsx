import { Inter_Tight } from 'next/font/google';
import type { SiteConfig } from '@/lib/content-model';
import { enabledNavigationItems, sectionHref } from '@/lib/site-navigation';
import SiteNav from './SiteNav';
import styles from './shell.module.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const SOCIAL = [
  { id: 'twitter', label: 'X/Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const;

type Props = {
  config: SiteConfig;
  /** The page: its content pane, plus an info sidebar when it has one open. */
  children: React.ReactNode;
};

// Rendered once by the (site) layout. The main navigation is always on the left (with the bio on
// the Lobby) and the page's content fills the rest; pages that need it slide an info/properties
// sidebar in from the right on demand.
export default function SiteShell({ config, children }: Props) {
  const name = config.name || 'Paul Elite';
  // The landing page is a menu item too ("Lobby"), so every page has a current item.
  const menu = [
    { id: 'lobby', label: 'Lobby', href: '/' },
    ...enabledNavigationItems(config).map((item) => ({
      id: item.id,
      label: item.label,
      href: sectionHref(item.target),
    })),
  ];
  const social = SOCIAL.filter((s) => config.social[s.id]).map((s) => ({
    id: s.id,
    label: s.label,
    href: config.social[s.id],
  }));
  const bio = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={`${interTight.className} ${styles.shell}`}>
      <SiteNav name={name} bio={bio} menu={menu} social={social} />
      {children}
    </main>
  );
}
