import { Suspense } from 'react';
import { getHomeData } from '@/lib/content-service';
import HomeContent from '@/components/HomeContent';
import WorkReel from '@/components/WorkReel';
import { buildReelSections } from '@/lib/reel';
import IllustrationsGallery from '@/components/IllustrationsGallery';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = { title: 'Explore' };

// The full browsing experience (sections, radial menu, settings, contact, now playing),
// linked from the home page's work reel.
export default async function Explore({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { config, content } = await getHomeData();
  const { view } = await searchParams;

  return (
    <main className="h-dvh bg-background overflow-hidden">
      <div className="w-full h-full pl-2 pr-6 md:px-6 overflow-hidden">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-400">Loading...</div>}>
          {view === 'writings' ? <WorkReel config={config} sections={buildReelSections(content, config.navigationItems)} writings={content.writings} view="writings" /> : view === 'illustration' ? <IllustrationsGallery illustrations={content.illustrations} /> : <HomeContent initialConfig={config} initialContent={content} />}
        </Suspense>
      </div>
    </main>
  );
}
