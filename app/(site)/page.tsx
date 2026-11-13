import { getSiteConfig } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import shell from '@/components/home/shell.module.css';

export const revalidate = 60;

// The Lobby: the showreel, centred on the screen.
export default async function Home() {
  const config = await getSiteConfig();
  const label = `${config.name || 'Paul Elite'} showreel`;

  return (
    <section className={`${shell.pane} ${shell.paneCentered}`} aria-label={label}>
      <PhoneReel label={label} />
    </section>
  );
}
