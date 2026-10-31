import Image from 'next/image';
import { Inter } from 'next/font/google';
import { getHomeData } from '@/lib/content-service';
import SectionIndex from '@/components/home/SectionIndex';
import styles from './home.module.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
export const revalidate = 60;

// Full-height sections; the page always settles on one of them (scroll-snap in home.module.css).
const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'explorations', label: 'Explorations' },
  { id: 'writing', label: 'Writing' },
];

const day = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default async function Home({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const [{ config, content }, { section }] = await Promise.all([getHomeData(), searchParams]);
  const shots = [
    ...content.illustrations.map((i) => ({ src: i.thumbnail || i.avatar, alt: i.title })),
    ...content.projects.flatMap((p) => [p.preview, ...(p.previewImages ?? [])].map((src) => ({ src, alt: p.title }))),
  ].filter((s): s is { src: string; alt: string } => Boolean(s.src));

  return (
    <main className={`${inter.className} ${styles.home}`}>
      <SectionIndex sections={SECTIONS} initial={SECTIONS.some((s) => s.id === section) ? section : undefined} />

      <section id="intro" aria-label="Introduction" className={styles.section}>
        <div className={styles.column}>
          <header className={styles.profile}>
            <Image
              src="/portrait.png"
              alt={`${config.name || 'Paul Elite'}, seen from behind, in a shirt that reads “Creatives are the new athletes”`}
              width={400}
              height={400}
              priority
              className={styles.portrait}
            />
            <div className={styles.nameBlock}>
              <h1>{config.name || 'Paul Elite'}</h1>
              {config.title && <p className={styles.role}>{config.title}</p>}
            </div>
          </header>

          <div className={styles.introduction}>
            {config.bio.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
              <p key={index}>
                {paragraph.split(/(design and build digital products)/i).map((part, partIndex) =>
                  /^design and build digital products$/i.test(part)
                    ? <strong key={partIndex}>{part}</strong>
                    : part,
                )}
              </p>
            ))}
            <p className={styles.contact}>
              {config.social.twitter && <><span>You can find me on </span><a href={config.social.twitter}>X</a></>}
              {config.social.email && <><span>{config.social.twitter ? ', or send me an ' : 'Send me an '}</span><a href={`mailto:${config.social.email.replace(/^mailto:/, '')}`}>email</a><span>.</span></>}
            </p>
          </div>
        </div>
      </section>

      <section id="work" aria-labelledby="work-title" className={styles.section}>
        <div className={styles.column}>
          <h2 id="work-title" className={styles.heading}>Work</h2>
          <ul className={styles.list}>
            {content.projects.map((p) => (
              <li key={p.id}>
                <span>{p.title}</span>
                {(p.year || p.role) && <span className={styles.meta}>{[p.year, p.role].filter(Boolean).join(' · ')}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="explorations" aria-labelledby="explorations-title" className={styles.section}>
        <div className={styles.column}>
          <h2 id="explorations-title" className={styles.heading}>Explorations</h2>
        </div>
        {shots.length ? (
          // A sideways strip keeps the section to one screen however many shots there are.
          <div className={styles.strip}>
            {shots.map((s, i) => <img key={s.src + i} src={s.src} alt={s.alt} loading="lazy" />)}
          </div>
        ) : (
          <p className={`${styles.column} ${styles.meta}`}>Explorations are on their way.</p>
        )}
      </section>

      <section id="writing" aria-labelledby="writing-title" className={styles.section}>
        <div className={styles.column}>
          <h2 id="writing-title" className={styles.heading}>Writing</h2>
          <ul className={styles.list}>
            {content.writings.map((w) => (
              <li key={w.id}>
                {w.link ? <a href={w.link}>{w.title}</a> : <span>{w.title}</span>}
                {w.date && <span className={styles.meta}>{day(w.date)}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
