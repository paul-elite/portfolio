import Link from 'next/link';
import { Inter_Tight } from 'next/font/google';
import type { PortfolioNavTarget, SiteConfig } from '@/lib/content-model';
import { enabledNavigationItems, sectionHref } from '@/lib/site-navigation';
import styles from '@/app/home.module.css';

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
  panelLabel: string;
  /** "reel" centres the phone; "content" is a scrolling list aligned to the top. */
  panel: 'reel' | 'content';
  children: React.ReactNode;
};

// The desktop split shared by every page: name, bio, a stacked menu and socials on the left,
// and the page's own content in the grey panel on the right.
export default function SiteShell({ config, active, panelLabel, panel, children }: Props) {
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const paragraphs = config.bio.split(/\n\s*\n/).filter(Boolean);
  const menu = enabledNavigationItems(config);
  const isHome = !active;

  return (
    <main className={`${interTight.className} ${styles.home} ${styles.wide}`}>
      <div className={`${styles.stage} ${isHome ? '' : styles.stageSection}`}>
        <section className={styles.info} aria-label="About">
          <div className={styles.intro}>
            {isHome ? (
              <h1 className={styles.name}>{name}</h1>
            ) : (
              <p className={styles.name}>
                <Link href="/" className={styles.nameLink}>{name}</Link>
              </p>
            )}
            {isHome && paragraphs.length > 0 && (
              <div className={styles.bio}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          <div className={styles.outro}>
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
        </section>

        <aside
          className={`${styles.panel} ${panel === 'content' ? styles.panelContent : ''}`}
          aria-label={panelLabel}
        >
          {children}
        </aside>
      </div>
    </main>
  );
}
