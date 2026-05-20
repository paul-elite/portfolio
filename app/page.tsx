import { Suspense } from 'react';
import { getHomeData } from '@/lib/content-service';
import HomeContent from '@/components/HomeContent';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { config, content } = await getHomeData();

  return (
    <main className="h-dvh bg-background overflow-hidden">
      <div className="w-full h-full pl-2 pr-6 md:px-6 overflow-hidden">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-400">Loading...</div>}>
          <HomeContent initialConfig={config} initialContent={content} />
        </Suspense>
      </div>
    </main>
  );
}
