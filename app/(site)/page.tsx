import Link from 'next/link';
import { getSiteConfig, getPortfolioContent } from '@/lib/content-service';
import SpotifyNow from '@/components/home/SpotifyNow';
import s from '@/components/home/benji.module.css';

export const revalidate = 60;

type Row = { key: string; title: string; year: string; date: string; href: string; external?: boolean };

function yearOf(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso.match(/\d{4}/)?.[0] ?? '') : String(d.getFullYear());
}

// Short, lowercase design category for the Work list's grey label.
const CATEGORY_ALIASES: Record<string, string> = {
  'case-study': 'study',
  'case study': 'study',
  'lead designer': 'design',
  designer: 'design',
  'design & development': 'design',
};
function formatCategory(raw: string) {
  const c = raw.trim().toLowerCase();
  if (CATEGORY_ALIASES[c]) return CATEGORY_ALIASES[c];
  return c.split(/[\s-]+/).pop() || c; // fall back to the last word
}

function groupByYear(rows: Row[]) {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const arr = map.get(r.year) || [];
    arr.push(r);
    map.set(r.year, arr);
  }
  return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
}

function List({ label, rows, newKey }: { label: string; rows: Row[]; newKey?: string }) {
  if (rows.length === 0) return null;
  const groups = groupByYear(rows);
  return (
    <section className={s.section}>
      <p className={s.sectionLabel}>{label}</p>
      {groups.map(([year, items]) => (
        <div className={s.group} key={year}>
          <div className={s.groupYear}>{year}</div>
          <ul className={s.rows}>
            {items.map((r) => (
              <li className={s.row} key={r.key}>
                <Link
                  className={s.rowLink}
                  href={r.href}
                  {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className={s.rowTitle}>
                    {r.title}
                    {r.key === newKey && <span className={s.new}>New</span>}
                  </span>
                  <span className={s.rowDate}>{r.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default async function Home() {
  const [config, content] = await Promise.all([getSiteConfig(), getPortfolioContent()]);
  const name = config.name || 'Paul Elite';
  const bio = config.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  // Everything is a "Featured" entry now — projects and writings together,
  // each with its category on the right (projects: study/design; writings: essay).
  type Item = Row & { ts: number };
  const projectItems: Item[] = content.projects
    .filter((p) => p.year)
    .map((p) => ({
      key: `p-${p.slug}`,
      title: p.title,
      year: p.year!,
      date: formatCategory((p.tags && p.tags[0]) || p.role || ''),
      href: p.link || `/projects/${p.slug}`,
      external: !!p.link,
      ts: new Date(`${p.year}-01-01T00:00:00Z`).getTime(),
    }));
  const writingItems: Item[] = content.writings
    .filter((w) => w.date)
    .map((w) => ({
      key: `w-${w.slug}`,
      title: w.title,
      year: yearOf(w.date!),
      date: 'essay',
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
        <h1 className={s.name}>{name}</h1>
        <p className={s.updated}>Designeeer</p>

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

        <List label="Featured" rows={featured} newKey={newestKey} />

        <footer className={s.footer}>
          <SpotifyNow />
        </footer>
      </div>
    </main>
  );
}
