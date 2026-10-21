import { getHomeData } from '@/lib/content-service';
import ColumnHome, { type HomeSection } from '@/components/home/ColumnHome';

export const revalidate = 60; // Revalidate every 60 seconds

const SECTIONS: HomeSection[] = ['work', 'explorations', 'writing', 'about'];

export default async function Home({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const [{ config, content }, { section }] = await Promise.all([getHomeData(), searchParams]);
  const active = SECTIONS.includes(section as HomeSection) ? (section as HomeSection) : 'work';
  return (
    <main className="bg-white">
      <ColumnHome config={config} content={content} section={active} />
    </main>
  );
}
