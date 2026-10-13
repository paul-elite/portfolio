import { getHomeData } from '@/lib/content-service';
import WorkReel from '@/components/WorkReel';
import { buildReelSections } from '@/lib/reel';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { config, content } = await getHomeData();

  const sections = buildReelSections(content, config.navigationItems);

  return (
    <main>
      <WorkReel config={config} sections={sections} />
    </main>
  );
}
