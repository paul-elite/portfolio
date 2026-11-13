import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { PortfolioNavTarget } from '@/lib/content-model';
import { getHomeData, getSiteConfig } from '@/lib/content-service';
import { enabledNavigationItems } from '@/lib/site-navigation';
import SiteShell from './SiteShell';
import WritingList from './WritingList';
import styles from '@/app/home.module.css';

type Row = { id: string; title: string; description?: string; meta?: string; href?: string };

export async function sectionMetadata(target: PortfolioNavTarget): Promise<Metadata> {
  const config = await getSiteConfig();
  const item = enabledNavigationItems(config).find((i) => i.target === target);
  const name = config.name || 'Paul Elite';
  return { title: item ? `${item.label} - ${name}` : name };
}

// One page per menu item. A section switched off in admin returns a 404.
export default async function SectionPage({ target }: { target: PortfolioNavTarget }) {
  const { config, content } = await getHomeData();
  const item = enabledNavigationItems(config).find((i) => i.target === target);
  if (!item) notFound();

  return (
    <SiteShell config={config} active={target} panel="content" panelLabel={item.label}>
      <div className={styles.section}>
        <h1 className={styles.sectionTitle}>{item.label}</h1>
        {target === 'writings' && (content.writings.length > 0 ? <WritingList items={content.writings} /> : <Empty label={item.label} />)}
        {target === 'projects' && (
          <Rows
            label={item.label}
            rows={content.projects.map((p) => ({ id: p.id, title: p.title, description: p.description, meta: p.year, href: p.link }))}
          />
        )}
        {target === 'interaction' && (
          <Rows
            label={item.label}
            rows={content.interactions.map((i) => ({ id: i.id, title: i.title, description: i.description, href: i.link }))}
          />
        )}
        {target === 'illustration' && <Gallery label={item.label} items={content.illustrations} />}
      </div>
    </SiteShell>
  );
}

function Empty({ label }: { label: string }) {
  return <p className={styles.sectionEmpty}>{label} will appear here soon.</p>;
}

function Rows({ rows, label }: { rows: Row[]; label: string }) {
  if (rows.length === 0) return <Empty label={label} />;
  return (
    <ul className={styles.rows}>
      {rows.map((row) => {
        const inner = (
          <>
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>{row.title}</span>
              {row.description && <span className={styles.rowDescription}>{row.description}</span>}
            </span>
            {row.meta && <span className={styles.rowMeta}>{row.meta}</span>}
          </>
        );
        return (
          <li key={row.id} className={styles.row}>
            {row.href ? <a href={row.href} target="_blank" rel="noreferrer">{inner}</a> : <div>{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}

type GalleryItem = { id: string; title: string; thumbnail?: string; youtubeUrl?: string };

function Gallery({ items, label }: { items: GalleryItem[]; label: string }) {
  const shown = items.filter((i) => i.thumbnail);
  if (shown.length === 0) return <Empty label={label} />;
  return (
    <ul className={styles.gallery}>
      {shown.map((item) => (
        <li key={item.id}>
          <a href={item.youtubeUrl || item.thumbnail} target="_blank" rel="noreferrer" aria-label={item.title}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin uploads can live on any host */}
            <img src={item.thumbnail} alt={item.title} loading="lazy" />
          </a>
        </li>
      ))}
    </ul>
  );
}
