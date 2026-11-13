import { getHomeData } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import SiteShell from '@/components/home/SiteShell';
import shell from '@/components/home/shell.module.css';
import styles from './home.module.css';

export const revalidate = 60;

export default async function Home() {
  const { config } = await getHomeData();
  const label = `${config.name || 'Paul Elite'} showreel`;
  const paragraphs = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <SiteShell config={config}>
      <section className={`${shell.pane} ${shell.paneCentered}`} aria-label={label}>
        <div className={styles.device}>
          <div className={styles.phone}>
            <PhoneReel label={label} />
          </div>
        </div>
      </section>

      {paragraphs.length > 0 && (
        <aside className={shell.info} aria-label="About">
          <div className={shell.infoHeader}>About</div>
          <div className={shell.bio}>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </aside>
      )}
    </SiteShell>
  );
}
