import { Inter_Tight } from 'next/font/google';
import { getHomeData } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import styles from './home.module.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});
export const revalidate = 60;

const SOCIAL = [
  { id: 'twitter', label: 'X/Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const;

export default async function Home() {
  const { config } = await getHomeData();
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const paragraphs = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={`${interTight.className} ${styles.home} ${styles.wide}`}>
      <div className={styles.stage}>
        <section className={styles.info} aria-labelledby="intro-name">
          <div className={styles.intro}>
            <h1 id="intro-name" className={styles.name}>{name}</h1>
            {paragraphs.length > 0 && (
              <div className={styles.bio}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {social.length > 0 && (
            <nav className={styles.socials} aria-label="Elsewhere">
              {social.map((s) => (
                <a key={s.id} href={config.social[s.id]} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </nav>
          )}
        </section>

        <aside className={styles.panel} aria-label={`${name} showreel`}>
          <div className={styles.device}>
            <div className={styles.phone}>
              <PhoneReel label={`${name} showreel`} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
