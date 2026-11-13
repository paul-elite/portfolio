import { getHomeData } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import SiteShell from '@/components/home/SiteShell';
import styles from './home.module.css';

export const revalidate = 60;

export default async function Home() {
  const { config } = await getHomeData();
  const label = `${config.name || 'Paul Elite'} showreel`;

  return (
    <SiteShell config={config} panel="reel" panelLabel={label}>
      <div className={styles.device}>
        <div className={styles.phone}>
          <PhoneReel label={label} />
        </div>
      </div>
    </SiteShell>
  );
}
