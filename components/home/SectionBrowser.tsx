'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from './shell.module.css';

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
};

type Props = {
  title: string;
  layout: 'list' | 'grid' | 'books';
  items: BrowserItem[];
};

// The middle pane's list plus the right info sidebar. Hovering an item with a mouse previews its
// details; clicking or tapping pins them until closed (× or Escape) or another item is picked.
// With nothing hovered or pinned, the right sidebar isn't rendered at all.
export default function SectionBrowser({ title, layout, items }: Props) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
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

  return (
    <>
      <section className={styles.pane} aria-label={title}>
        <div className={styles.section}>
          <h1 className={styles.sectionTitle}>{title}</h1>

          {items.length === 0 && <p className={styles.empty}>{title} will appear here soon.</p>}

          {items.length > 0 && layout === 'list' && (
            <ul className={styles.rows} onPointerLeave={() => setHoverId(null)}>
              {items.map((item) => (
                <li key={item.id}>
                  <button {...itemProps(item)} className={`${styles.row} ${item.id === pinnedId ? styles.rowActive : ''}`}>
                    <span className={styles.rowTitle}>{item.title}</span>
                    {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

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
                ×
              </button>
            )}
          </div>

          {shown.image && (
            /* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */
            <img className={styles.infoImage} src={shown.image} alt="" />
          )}

          <h2 className={styles.infoTitle}>{shown.title}</h2>
          {shown.description && <p className={styles.infoDescription}>{shown.description}</p>}

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

          {shown.href && (
            <a className={styles.infoLink} href={shown.href} target="_blank" rel="noreferrer">
              {shown.hrefLabel || 'Open'} ↗
            </a>
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
