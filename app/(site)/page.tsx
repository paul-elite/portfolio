import { getSiteConfig } from '@/lib/content-service';
import PhoneReel from '@/components/home/PhoneReel';
import shell from '@/components/home/shell.module.css';

export const revalidate = 60;

// The Lobby: the showreel, centred on the screen. On phones the sidebar is a drawer, so the name
// and bio also sit at the top of the page there (desktop already shows them in the sidebar).
export default async function Home() {
  const config = await getSiteConfig();
  const name = config.name || 'Paul Elite';
  const label = `${name} showreel`;
  const bio = config.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <section className={`${shell.pane} ${shell.paneCentered}`} aria-label={label}>
      <div className={shell.lobbyIntro}>
        <p className={shell.name}>{name}</p>
        {bio.length > 0 && (
          <div className={shell.bio}>
            {bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
      <div className={shell.lobbyReel}>
        <PhoneReel label={label} />
      </div>
    </section>
  );
}
