import Link from 'next/link';
import { Inter_Tight } from 'next/font/google';
import type { PortfolioNavTarget, SiteConfig } from '@/lib/content-model';
import { enabledNavigationItems, sectionHref } from '@/lib/site-navigation';
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
  /** The section being viewed; leave unset on the home page. */
  active?: PortfolioNavTarget;
  /** The middle pane and, when there is something to show, the right info sidebar. */
  children: React.ReactNode;
};

// Three columns on desktop: the main navigation always on the left, the page's content in the
// middle, and an info/properties sidebar on the right that pages add only when they need it.
export default function SiteShell({ config, active, children }: Props) {
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const menu = enabledNavigationItems(config);

  return (
    <main className={`${interTight.className} ${styles.shell}`}>
      <header className={styles.nav}>
        {active ? (
          <p className={styles.name}>
            <Link href="/" className={styles.nameLink}>{name}</Link>
          </p>
        ) : (
          <h1 className={styles.name}>{name}</h1>
        )}

        <div className={styles.navBottom}>
          {menu.length > 0 && (
            <nav className={styles.menu} aria-label="Sections">
              <ul>
                {menu.map((item) => {
                  const current = item.target === active;
                  return (
                    <li key={item.id}>
                      <Link
                        href={sectionHref(item.target)}
                        aria-current={current ? 'page' : undefined}
                        className={current ? styles.menuCurrent : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {social.length > 0 && (
            <nav className={styles.socials} aria-label="Elsewhere">
              {social.map((s) => (
                <a key={s.id} href={config.social[s.id]} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {children}
    </main>
  );
}
