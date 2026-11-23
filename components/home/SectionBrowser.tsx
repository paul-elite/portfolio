'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from './shell.module.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

// The book covers set their titles in Inter Medium, as in the Figma book component.
const bookFont = Inter({ subsets: ['latin'], weight: ['500'], display: 'swap' });

export type BrowserItem = {
  id: string;
  title: string;
  description?: string;
  /** Short value on the right of a list row, e.g. the year. */
  meta?: string;
  /** Extra context for a book's accessible name, e.g. the full date. */
  subtitle?: string;
  image?: string;
  href?: string;
  hrefLabel?: string;
  properties: { label: string; value: string }[];
  /** A second, quieter line under the title in a list row, e.g. the podcast's name */
  byline?: string;
  /** Show the image as a small cover at the start of a list row */
  thumb?: boolean;
  /** Longer text for the details, paragraphs split by blank lines */
  body?: string;
  topics?: string[];
  /** Several links: the first is the main button, the rest quiet links under it */
  links?: { label: string; href: string }[];
  /** A short line about what's still to come, e.g. "Recorded, not out yet" */
  note?: string;
};

export type BrowserGroup = { label: string; items: BrowserItem[]; empty: string };

type Props = {
  title: string;
  layout: 'list' | 'grid' | 'books';
  items: BrowserItem[];
  /** A list in labelled parts (Upcoming, Past), each with its own empty line */
  groups?: BrowserGroup[];
  /** Pinning an item puts its id in the address (#id), so a link can open it */
  deepLink?: boolean;
};

// The middle pane's list plus the right info sidebar. Hovering an item with a mouse previews its
// details; clicking or tapping pins them until closed (× or Escape) or another item is picked.
// With nothing hovered or pinned, the right sidebar isn't rendered at all.
export default function SectionBrowser({ title, layout, items: flat, groups, deepLink }: Props) {
  const items = groups ? groups.flatMap((g) => g.items) : flat;
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Opening the page at #id pins that item; pinning one keeps the address in step
  useEffect(() => {
    if (!deepLink) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && items.some((i) => i.id === id)) setPinnedId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on arrival
  }, [deepLink]);
  useEffect(() => {
    if (!deepLink) return;
    const url = pinnedId ? `#${encodeURIComponent(pinnedId)}` : window.location.pathname + window.location.search;
    history.replaceState(null, '', url);
  }, [deepLink, pinnedId]);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!pinnedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPinnedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinnedId]);

  const shownId = hoverId ?? pinnedId;
  const shown = items.find((i) => i.id === shownId) ?? null;
  const isPinned = !!shown && shown.id === pinnedId;

  const itemProps = (item: BrowserItem) => ({
    type: 'button' as const,
    'aria-pressed': item.id === pinnedId,
    'aria-controls': 'section-info',
    onClick: () => setPinnedId((id) => (id === item.id ? null : item.id)),
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHoverId(item.id);
    },
    onContextMenu: (event: React.MouseEvent) => {
      // A long press on touch opens the info instead of the system menu.
      if ((event.nativeEvent as PointerEvent).pointerType !== 'mouse') {
        event.preventDefault();
        setPinnedId(item.id);
      }
    },
  });

  const listRows = (rows: BrowserItem[]) => (
    <ul className={styles.rows} onPointerLeave={() => setHoverId(null)}>
      {rows.map((item) => (
        <li key={item.id}>
          <button {...itemProps(item)} className={`${styles.row} ${item.byline || item.thumb ? styles.rowRich : ''} ${item.id === pinnedId ? styles.rowActive : ''}`}>
            {item.thumb && (
              <span className={styles.rowThumb} aria-hidden="true">
                {item.image
                  ? /* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */
                    <img src={item.image} alt="" loading="lazy" />
                  : <span>{item.title.trim()[0]?.toUpperCase()}</span>}
              </span>
            )}
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>{item.title}</span>
              {item.byline && <span className={styles.rowByline}>{item.byline}</span>}
            </span>
            {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <section className={styles.pane} aria-label={title}>
        <div className={styles.section}>
          <h1 className={styles.sectionTitle}>{title}</h1>

          {!groups && items.length === 0 && <p className={styles.empty}>{title} will appear here soon.</p>}

          {!groups && items.length > 0 && layout === 'list' && listRows(items)}

          {groups?.map((g) => (
            <section key={g.label} className={styles.group} aria-label={g.label}>
              <h2 className={styles.groupLabel}>{g.label}</h2>
              {g.items.length > 0 ? listRows(g.items) : <p className={styles.groupEmpty}>{g.empty}</p>}
            </section>
          ))}

          {items.length > 0 && layout === 'books' && (
            <ul className={styles.books} onPointerLeave={() => setHoverId(null)}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    {...itemProps(item)}
                    className={`${styles.book} ${item.id === pinnedId ? styles.rowActive : ''}`}
                  >
                    <BookCover item={item} />
                    <span className={styles.bookCaption}>
                      <span className={styles.bookCaptionTitle}>{item.title}</span>
                      {item.subtitle && <span className={styles.bookCaptionDate}>{item.subtitle}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && layout === 'grid' && (
            <ul className={styles.gallery} onPointerLeave={() => setHoverId(null)}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    {...itemProps(item)}
                    aria-label={item.title}
                    className={`${styles.tile} ${item.id === pinnedId ? styles.rowActive : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */}
                    <img src={item.image} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {shown && (
        <aside
          id="section-info"
          key={shown.id}
          className={`${styles.info} ${isPinned ? styles.infoSheet : ''}`}
          aria-label={`${shown.title} details`}
        >
          <div className={styles.infoHeader}>
            <span>Info</span>
            {isPinned && (
              <button type="button" className={styles.close} onClick={() => setPinnedId(null)} aria-label="Close details">
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
              </button>
            )}
          </div>

          {shown.image && (
            /* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */
            <img className={`${styles.infoImage} ${shown.thumb ? styles.infoCover : ''}`} src={shown.image} alt="" />
          )}

          <h2 className={styles.infoTitle}>{shown.title}</h2>
          {shown.byline && <p className={styles.infoByline}>{shown.byline}</p>}
          {shown.description && <p className={styles.infoDescription}>{shown.description}</p>}
          {shown.body?.split(/\n\s*\n/).map((para, i) => <p key={i} className={styles.infoBody}>{para.trim()}</p>)}

          {shown.topics && shown.topics.length > 0 && (
            <ul className={styles.topics} aria-label="Topics">
              {shown.topics.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}

          {shown.properties.length > 0 && (
            <dl className={styles.props}>
              {shown.properties.map((p) => (
                <div key={p.label} style={{ display: 'contents' }}>
                  <dt>{p.label}</dt>
                  <dd>{p.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {shown.note && <p className={styles.infoNote}>{shown.note}</p>}

          {shown.href && (
            <a className={styles.infoLink} href={shown.href} target="_blank" rel="noreferrer">
              {shown.hrefLabel || 'Open'}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}

          {shown.links && shown.links.length > 0 && (
            <div className={styles.infoLinks}>
              {shown.links.map((l, i) => (
                <a key={l.href} className={i === 0 ? styles.infoLink : styles.infoLinkQuiet} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </aside>
      )}
    </>
  );
}

// A small printed book, after the Figma book component ("Thinking in Colors", node 1616:304208):
// a soft white gradient cover with two spine hairlines, the title set small at the top and an
// illustration below. Every measurement is a fraction of the cover's width (cqw), so the book
// keeps the design's proportions at any size. The illustration is the writing's own image;
// writings without one get a quiet monogram.
function BookCover({ item }: { item: BrowserItem }) {
  return (
    <span className={`${styles.bookCover} ${bookFont.className}`}>
      <span className={styles.bookSpine} aria-hidden="true" />
      <span className={`${styles.bookSpine} ${styles.bookSpineInner}`} aria-hidden="true" />
      <span className={styles.bookFace}>
        <span className={`${styles.bookTitle} ${item.title.length > 20 ? styles.bookTitleLong : ''}`} aria-hidden="true">
          {item.title}
        </span>
        {item.image ? (
          /* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */
          <img className={styles.bookArt} src={item.image} alt="" />
        ) : (
          <span className={`${styles.bookArt} ${styles.bookMonogram}`} aria-hidden="true">
            {item.title.trim()[0]?.toUpperCase()}
          </span>
        )}
      </span>
    </span>
  );
}
