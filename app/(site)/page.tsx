import Link from 'next/link';
import { getSiteConfig, getPortfolioContent } from '@/lib/content-service';
import SpotifyNow from '@/components/home/SpotifyNow';
import GlitchName from '@/components/home/GlitchName';
import s from '@/components/home/benji.module.css';

export const revalidate = 60;

type Row = { key: string; title: string; cat: string; href: string; external?: boolean };

// The category/type label shown in the left rail: Essay (writings), Study / Design (projects).
const CATEGORY_ALIASES: Record<string, string> = {
  'case-study': 'Study',
  'case study': 'Study',
  'lead designer': 'Design',
  designer: 'Design',
  'design & development': 'Design',
};
function cap(x: string) {
  return x ? x[0].toUpperCase() + x.slice(1) : x;
}
function formatCategory(raw: string) {
  const c = raw.trim().toLowerCase();
  if (CATEGORY_ALIASES[c]) return CATEGORY_ALIASES[c];
  return cap(c.split(/[\s-]+/).pop() || c);
}

function FeaturedList({ items, newKey }: { items: Row[]; newKey?: string }) {
  if (items.length === 0) return null;
  return (
    <section className={s.section}>
      <p className={s.sectionLabel}>Featured</p>
      <ul className={s.rows}>
        {items.map((r) => (
          <li className={s.row} key={r.key}>
            <Link
              className={s.workLink}
              href={r.href}
              {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className={s.workCat}>{r.cat}</span>
              <span className={s.rowTitle}>
                {r.title}
                {r.key === newKey && <span className={s.new}>New</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Home() {
  const [config, content] = await Promise.all([getSiteConfig(), getPortfolioContent()]);
  const name = config.name || 'Paul Elite';
  const bio = config.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  // Everything is a "Featured" entry — projects and writings together, each with
  // its type on the left (Study / Design / Essay). No dates.
  type Item = Row & { ts: number };
  const projectItems: Item[] = content.projects
    .filter((p) => p.year)
    .map((p) => ({
      key: `p-${p.slug}`,
      title: p.title,
      cat: formatCategory((p.tags && p.tags[0]) || p.role || ''),
      href: p.link || `/projects/${p.slug}`,
      external: !!p.link,
      ts: new Date(`${p.year}-01-01T00:00:00Z`).getTime(),
    }));
  const writingItems: Item[] = content.writings
    .filter((w) => w.date)
    .map((w) => ({
      key: `w-${w.slug}`,
      title: w.title,
      cat: 'Essay',
      href: w.link || `/writings/${w.slug}`,
      external: !!w.link,
      ts: new Date(w.date!).getTime(),
    }));
  const featured: Row[] = [...projectItems, ...writingItems].sort((a, b) => b.ts - a.ts);
  const newestKey = featured[0]?.key;

  const socialBits: React.ReactNode[] = [];
  if (config.social.twitter) socialBits.push(<a key="x" className={s.link} href={config.social.twitter} target="_blank" rel="noopener noreferrer">X</a>);
  if (config.social.linkedin) socialBits.push(<a key="li" className={s.link} href={config.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>);
  if (config.social.email) socialBits.push(<a key="em" className={s.link} href={`mailto:${config.social.email}`}>email</a>);

  return (
    <main className={s.page}>
      <div className={s.col}>
        <header className={s.header}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.portrait} src="/portrait.jpg" alt={name} />
          <div className={s.headText}>
            <GlitchName name={name} className={s.name} />
            <p className={s.updated}>Designeeer</p>
          </div>
        </header>

        <div className={s.bio}>
          {bio.map((p, i) => <p key={i}>{p}</p>)}
          <p>
            You can see my work across{' '}
            <Link className={s.link} href="/projects">Projects</Link>,{' '}
            <Link className={s.link} href="/illustration">Illustration</Link>, and{' '}
            <Link className={s.link} href="/interaction">Interaction</Link>.
          </p>
          {socialBits.length > 0 && (
            <p>
              You can find me on{' '}
              {socialBits.map((node, i) => (
                <span key={i}>
                  {node}
                  {i < socialBits.length - 2 ? ', ' : i === socialBits.length - 2 ? ', or ' : ''}
                </span>
              ))}
              .
            </p>
          )}
        </div>

        <FeaturedList items={featured} newKey={newestKey} />

        <footer className={s.footer}>
          <SpotifyNow />
        </footer>
      </div>
    </main>
  );
}
