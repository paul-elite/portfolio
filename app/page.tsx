import { Inter } from 'next/font/google';
import { getHomeData } from '@/lib/content-service';
import AvatarCard, { type CardAction } from '@/components/home/AvatarCard';
import styles from './home.module.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
export const revalidate = 60;

// Set at build time in next.config.ts, so "Updated" is the last deploy.
const updated = process.env.SITE_UPDATED ? new Date(process.env.SITE_UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ (\d{4})$/, ', $1') : '';

const SOCIAL: { id: keyof typeof LABEL; label: string }[] = [
  { id: 'twitter', label: 'X' },
  { id: 'github', label: 'Github' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'behance', label: 'Behance' },
];
const LABEL = { twitter: 'X (Twitter)', github: 'Github', linkedin: 'LinkedIn', instagram: 'Instagram', behance: 'Behance' };

export default async function Home() {
  const { config, content } = await getHomeData();
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const email = config.social.email ? `mailto:${config.social.email.replace(/^mailto:/, '')}` : '';
  const actions: CardAction[] = [
    ...(email ? [{ id: 'email', label: 'Email', href: email }] : []),
    ...social.map((s) => ({ id: s.id, label: LABEL[s.id], href: config.social[s.id] })),
  ];

  return (
    <main className={`${inter.className} ${styles.home}`}>
      <AvatarCard src="/portrait.png" thumb="/portrait-avatar.png" name={name} actions={actions} />

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
        {(social.length > 0 || email) && (
          <p>
            {social.length > 0 && <>You can find me on {social.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === social.length - 1 && !email ? ' or ' : ', ')}
                <a href={config.social[s.id]} target="_blank" rel="noreferrer">{s.label}</a>
              </span>
            ))}</>}
            {email && <>{social.length ? ' or send me an ' : 'Send me an '}<a href={email}>Email</a></>}.
          </p>
        )}
      </div>

      {content.projects.length > 0 && (
        <section className={styles.group} aria-labelledby="work-title">
          <h2 id="work-title" className={styles.heading}>Work</h2>
          <ul className={styles.list}>
            {content.projects.map((p) => (
              <li key={p.id}>
                {/* Case-study pages are cleared for the redesign, so only outside links are linked. */}
                {p.link ? <a href={p.link} target="_blank" rel="noreferrer" className={styles.itemTitle}>{p.title}</a> : <span className={styles.itemTitle}>{p.title}</span>}
                {p.description && <p>{p.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.writings.length > 0 && (
        <section className={styles.group} aria-labelledby="writing-title">
          <h2 id="writing-title" className={styles.heading}>Writing</h2>
          <ul className={styles.list}>
            {content.writings.map((w) => (
              <li key={w.id}>
                {w.link ? <a href={w.link} target="_blank" rel="noreferrer" className={styles.itemTitle}>{w.title}</a> : <span className={styles.itemTitle}>{w.title}</span>}
                {w.description && <p>{w.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {updated && <p className={styles.updated}>Updated {updated}</p>}
    </main>
  );
}
