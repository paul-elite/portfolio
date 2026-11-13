'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { iconColor } from '@/lib/icon-color';
import type { PortfolioNavTarget } from '@/lib/content-model';
import PortfolioNavigationIcon from '@/components/experience/PortfolioNavigationIcon';
import styles from './shell.module.css';

type NavLink = { id: string; label: string; href: string };
type MenuLink = NavLink & { target?: PortfolioNavTarget; icon?: string };
type SocialLink = NavLink & { image?: string };

// The hand-drawn scribble marks (public/social-*.svg), revealed on hover/focus like the menu
// icons. They are used as a stencil filled with the link's current colour, so the scribble
// darkens with its label. An image uploaded for the network in the admin (socialImages) wins.
const SCRIBBLES: Record<string, string> = {
  twitter: '/social-x.svg',
  linkedin: '/social-linkedin.svg',
  instagram: '/social-instagram.svg',
};

function SocialMark({ link }: { link: SocialLink }) {
  if (link.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.socialMarkArt} src={link.image} alt="" />;
  }
  const scribble = SCRIBBLES[link.id];
  if (!scribble) return null;
  return (
    <span
      className={`${styles.socialMarkArt} ${styles.scribble}`}
      style={{ '--scribble': `url(${scribble})` } as CSSProperties}
    />
  );
}

function LobbyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10l7-6 7 6v7.5a.5.5 0 0 1-.5.5H13v-5H9v5H4.5a.5.5 0 0 1-.5-.5z" />
    </svg>
  );
}

// Hidden until hover/focus: the uploaded navigation icon, or the matching line icon.
function MenuIcon({ item, iconRef }: { item: MenuLink; iconRef?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={iconRef} className={styles.menuIcon} aria-hidden="true">
      {item.target ? (
        <PortfolioNavigationIcon target={item.target} src={item.icon} className={styles.menuIconArt} imageFit="cover" />
      ) : (
        <LobbyIcon className={styles.menuIconArt} />
      )}
    </span>
  );
}

// On hover/focus a link takes on its icon's most abundant colour (see lib/icon-color). Measured
// once per icon after mount, so any icon uploaded later is picked up automatically.
function useIconHoverColor(iconKey: string | undefined) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [color, setColor] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    iconColor(iconRef.current).then((c) => {
      if (live) setColor(c);
    });
    return () => {
      live = false;
    };
  }, [iconKey]);
  const style = color ? ({ '--hover-color': color } as CSSProperties) : undefined;
  return { iconRef, style };
}

function MenuItem({ item, current }: { item: MenuLink; current: boolean }) {
  const { iconRef, style } = useIconHoverColor(item.icon ?? item.id);
  return (
    <Link
      href={item.href}
      aria-current={current ? 'page' : undefined}
      className={current ? styles.menuCurrent : undefined}
      style={style}
    >
      <MenuIcon item={item} iconRef={iconRef} />
      <span className={`${styles.menuLabel} ${styles.weightStable}`} data-text={item.label}>{item.label}</span>
    </Link>
  );
}

function SocialItem({ link }: { link: SocialLink }) {
  const { iconRef, style } = useIconHoverColor(link.image ?? link.id);
  return (
    <a href={link.href} target="_blank" rel="noreferrer" style={style}>
      <span
        ref={iconRef}
        className={`${styles.socialMark} ${link.id === 'linkedin' ? styles.socialMarkLarge : ''}`}
        aria-hidden="true"
      >
        <SocialMark link={link} />
      </span>
      <span className={styles.weightStable} data-text={link.label}>{link.label}</span>
    </a>
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
                  <MenuItem item={item} current={current} />
                </li>
              );
            })}
          </ul>
        </nav>

        {social.length > 0 && (
          <nav className={styles.socials} aria-label="Elsewhere">
            {social.map((s) => (
              <SocialItem key={s.id} link={s} />
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
