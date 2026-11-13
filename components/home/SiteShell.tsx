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
  /** The content pane, plus an info sidebar when the page has one open. */
  children: React.ReactNode;
};

// The main navigation is always on the left (with the bio on the home page) and the page's content
// fills the rest. Pages that need it slide an info/properties sidebar in from the right on demand.
export default function SiteShell({ config, active, children }: Props) {
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const menu = enabledNavigationItems(config);
  const paragraphs = active ? [] : config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={`${interTight.className} ${styles.shell}`}>
      <header className={styles.nav}>
        <div>
          {active ? (
            <p className={styles.name}>
              <Link href="/" className={styles.nameLink}>{name}</Link>
            </p>
          ) : (
            <h1 className={styles.name}>{name}</h1>
          )}
          {paragraphs.length > 0 && (
            <div className={styles.bio}>
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

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
