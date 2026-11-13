import { getHomeData } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import SiteShell from '@/components/home/SiteShell';
import shell from '@/components/home/shell.module.css';

export const revalidate = 60;

export default async function Home() {
  const { config } = await getHomeData();
  const label = `${config.name || 'Paul Elite'} showreel`;

  return (
    <SiteShell config={config}>
      <section className={`${shell.pane} ${shell.paneCentered}`} aria-label={label}>
        <PhoneReel label={label} />
      </section>
    </SiteShell>
  );
}
