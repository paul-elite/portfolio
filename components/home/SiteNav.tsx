'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PortfolioNavTarget } from '@/lib/content-model';
import PortfolioNavigationIcon from '@/components/experience/PortfolioNavigationIcon';
import styles from './shell.module.css';

type NavLink = { id: string; label: string; href: string };
type MenuLink = NavLink & { target?: PortfolioNavTarget; icon?: string };
type SocialLink = NavLink & { image?: string };

// Brand marks in their own colours, revealed on hover/focus like the menu icons.
// An image uploaded for the network in the admin (socialImages) wins over these.
function SocialMark({ link }: { link: SocialLink }) {
  if (link.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.socialMarkArt} src={link.image} alt="" />;
  }
  if (link.id === 'linkedin') {
    return (
      <svg className={styles.socialMarkArt} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#0A66C2" />
        <circle cx="7.1" cy="7.2" r="1.7" fill="#fff" />
        <rect x="5.6" y="9.7" width="3" height="8.8" rx="0.4" fill="#fff" />
        <path d="M10.9 9.7h2.9v1.3c.45-.8 1.5-1.5 3-1.5 3 0 3.6 1.95 3.6 4.5v4.5h-3v-4c0-.95-.02-2.2-1.4-2.2-1.4 0-1.6 1.05-1.6 2.13v4.07h-3z" fill="#fff" />
      </svg>
    );
  }
  if (link.id === 'twitter') {
    return (
      <svg className={styles.socialMarkArt} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#000" />
        <path d="M16.6 5.5h2.2l-4.8 5.5 5.6 7.5h-4.4l-3.5-4.5-4 4.5H5.5l5.1-5.9L5.2 5.5h4.5l3.1 4.1zm-.8 11.7h1.2L8.9 6.7H7.6z" fill="#fff" />
      </svg>
    );
  }
  return null;
}

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
  social: SocialLink[];
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
                    <span className={`${styles.menuLabel} ${styles.weightStable}`} data-text={item.label}>{item.label}</span>
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
                <span className={styles.socialMark} aria-hidden="true"><SocialMark link={s} /></span>
                <span className={styles.weightStable} data-text={s.label}>{s.label}</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
