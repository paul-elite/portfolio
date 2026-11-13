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
  { id: 'instagram', label: 'Instagram' },
] as const;

// A bare network homepage (the built-in placeholder) isn't a profile.
function isProfileUrl(url: string | undefined) {
  if (!url) return false;
  try {
    const { pathname } = new URL(url);
    return pathname.replace(/\/+$/, '') !== '';
  } catch {
    return false;
  }
}

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
      target: item.target,
      icon: item.icon || undefined,
    })),
  ];
  const social = SOCIAL.filter((s) =>
    // Instagram is new here: show it only once a real profile is saved in admin.
    s.id === 'instagram' ? isProfileUrl(config.social.instagram) : !!config.social[s.id],
  ).map((s) => ({
    id: s.id,
    label: s.label,
    href: config.social[s.id],
    image: config.socialImages?.[s.id] || undefined,
  }));
  const bio = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={`${interTight.className} ${styles.shell}`}>
      <SiteNav name={name} bio={bio} menu={menu} social={social} />
      {children}
    </main>
  );
}
