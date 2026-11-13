'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './shell.module.css';

type NavLink = { id: string; label: string; href: string };

type Props = {
  name: string;
  bio: string[];
  menu: NavLink[];
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
                    {item.label}
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
