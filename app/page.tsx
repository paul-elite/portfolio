import { Inter } from 'next/font/google';
import Image from 'next/image';
import { getHomeData } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import styles from './home.module.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
export const revalidate = 60;

const SOCIAL = [
  { id: 'twitter', label: 'X' },
  { id: 'github', label: 'Github' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'behance', label: 'Behance' },
] as const;

export default async function Home() {
  const { config } = await getHomeData();
  const name = config.name || 'Paul Elite';
  const social = SOCIAL.filter((s) => config.social[s.id]);
  const email = config.social.email ? `mailto:${config.social.email.replace(/^mailto:/, '')}` : '';
  const paragraphs = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={`${inter.className} ${styles.home} ${styles.wide}`}>
      <div className={styles.stage}>
        <section className={styles.info} aria-labelledby="intro-name">
          <header className={styles.identity}>
            <Image
              src="/portrait-avatar.png"
              alt=""
              width={44}
              height={44}
              priority
              className={styles.avatar}
            />
            <div>
              <h1 id="intro-name" className={styles.name}>{name}</h1>
              {config.title && <p className={styles.role}>{config.title}</p>}
            </div>
          </header>

          {paragraphs.length > 0 && (
            <div className={styles.bio}>
              {paragraphs.map((paragraph, index) => (
                <p key={index}>
                  {paragraph.split(/(design and build digital products)/i).map((part, partIndex) =>
                    /^design and build digital products$/i.test(part)
                      ? <strong key={partIndex}>{part}</strong>
                      : part,
                  )}
                </p>
              ))}
            </div>
          )}

          {social.length > 0 && (
            <nav className={styles.socials} aria-label="Elsewhere">
              {social.map((s) => (
                <a key={s.id} href={config.social[s.id]} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </nav>
          )}

          {email && (
            <p className={styles.contact}>
              <a href={email}>Email</a>
            </p>
          )}
        </section>

        <div className={styles.deviceWrap}>
          {/* Drop the showreel at public/reel.mp4; the phone picks it up automatically. */}
          <div className={styles.device}>
            <div className={styles.screen}>
              <div className={styles.screenInner}>
                <PhoneReel label={`${name} showreel`} />
              </div>
            </div>
            <Image
              src="/mockups/iphone-16-pro-max.png"
              alt=""
              fill
              priority
              sizes="(max-width: 860px) 72vw, 340px"
              className={styles.frame}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
