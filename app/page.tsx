import Image from 'next/image';
import { Inter } from 'next/font/google';
import { getSiteConfig } from '@/lib/content-service';
import styles from './home.module.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
export const revalidate = 60;

export default async function Home() {
  const config = await getSiteConfig();

  return (
    <main className={`${inter.className} ${styles.home}`}>
      <header className={styles.profile}>
        <div className={styles.portrait}>
          {config.avatar ? (
            <Image src={config.avatar} alt={config.name} width={56} height={56} unoptimized priority />
          ) : (
            <span className={styles.portraitPlaceholder} role="img" aria-label="Paul Elite profile image placeholder">PE</span>
          )}
        </div>
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
    </main>
  );
}
