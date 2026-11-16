import Link from 'next/link';
import { getSiteConfig, getPortfolioContent } from '@/lib/content-service';
import SpotifyNow from '@/components/home/SpotifyNow';
import s from '@/components/home/benji.module.css';

export const revalidate = 60;

type Row = { key: string; title: string; year: string; date: string; href: string; external?: boolean };
type WorkRow = { key: string; title: string; cat: string; href: string; external?: boolean };

function monthDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function yearOf(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso.match(/\d{4}/)?.[0] ?? '') : String(d.getFullYear());
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

  const writings: Row[] = content.writings
    .filter((w) => w.date)
    .map((w) => ({
      key: `w-${w.slug}`,
      title: w.title,
      year: yearOf(w.date!),
      date: monthDay(w.date!),
      href: w.link || '/writings',
      external: !!w.link,
    }))
    .sort((a, b) => (a.year === b.year ? b.date.localeCompare(a.date) : Number(b.year) - Number(a.year)));

  const projects: WorkRow[] = content.projects.map((p) => ({
    key: `p-${p.slug}`,
    title: p.title,
    cat: (p.tags && p.tags[0]) || p.role || '',
    href: p.link || '/projects',
    external: !!p.link,
  }));

  const newestWriting = writings[0]?.key;

  const socialBits: React.ReactNode[] = [];
  if (config.social.twitter) socialBits.push(<a key="x" className={s.link} href={config.social.twitter} target="_blank" rel="noopener noreferrer">X</a>);
  if (config.social.linkedin) socialBits.push(<a key="li" className={s.link} href={config.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>);
  if (config.social.email) socialBits.push(<a key="em" className={s.link} href={`mailto:${config.social.email}`}>email</a>);

  return (
    <main className={s.page}>
      <div className={s.col}>
        <h1 className={s.name}>{name}</h1>
        <p className={s.updated}>Designer</p>

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

        {projects.length > 0 && (
          <section className={s.section}>
            <p className={s.sectionLabel}>Work</p>
            <ul className={s.rows}>
              {projects.map((r) => (
                <li className={s.row} key={r.key}>
                  <Link
                    className={s.workLink}
                    href={r.href}
                    {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className={s.workCat}>{r.cat}</span>
                    <span className={s.rowTitle}>{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <List label="Writing" rows={writings} newKey={newestWriting} />

        <footer className={s.footer}>
          <SpotifyNow />
        </footer>
      </div>
    </main>
  );
}
