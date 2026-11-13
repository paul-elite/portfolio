'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PortfolioNavTarget } from '@/lib/content-model';
import PortfolioNavigationIcon from '@/components/experience/PortfolioNavigationIcon';
import styles from './shell.module.css';

type NavLink = { id: string; label: string; href: string };
type MenuLink = NavLink & { target?: PortfolioNavTarget; icon?: string };

function LobbyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10l7-6 7 6v7.5a.5.5 0 0 1-.5.5H13v-5H9v5H4.5a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

// Hidden until hover/focus: the uploaded navigation icon, or the matching line icon.
function MenuIcon({ item }: { item: MenuLink }) {
  return (
    <span className={styles.menuIcon} aria-hidden="true">
      {item.target ? (
        <PortfolioNavigationIcon target={item.target} src={item.icon} className={styles.menuIconArt} imageFit="cover" />
      ) : (
        <LobbyIcon className={styles.menuIconArt} />
      )}
    </span>
  );
}

type Props = {
  name: string;
  bio: string[];
  menu: MenuLink[];
  social: NavLink[];
};

function isCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The left sidebar. It lives in the shared layout, so it stays mounted while pages change: the
// current item's colour and underline glide to the new item instead of the whole nav re-rendering.
// The bio belongs to the Lobby and folds away (rather than vanishing) on the other pages.
export default function SiteNav({ name, bio, menu, social }: Props) {
  const pathname = usePathname();
  const onLobby = pathname === '/';

  return (
    <header className={styles.nav}>
      <div>
        {onLobby ? (
          <h1 className={styles.name}>{name}</h1>
        ) : (
          <p className={styles.name}>
            <Link href="/" className={styles.nameLink}>{name}</Link>
          </p>
        )}
        {bio.length > 0 && (
          <div className={`${styles.bioFold} ${onLobby ? '' : styles.bioFolded}`} aria-hidden={!onLobby}>
            <div className={styles.bioFoldInner}>
              <div className={styles.bio}>
                {bio.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.navBottom}>
        <nav className={styles.menu} aria-label="Sections">
          <ul>
            {menu.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={current ? styles.menuCurrent : undefined}
                  >
                    <MenuIcon item={item} />
                    <span className={styles.menuLabel}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {social.length > 0 && (
          <nav className={styles.socials} aria-label="Elsewhere">
            {social.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
