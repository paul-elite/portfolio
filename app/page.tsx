import { getHomeData } from '@/lib/content-service';
import { projects as sampleProjects } from '@/lib/data';
import WorkReel from '@/components/WorkReel';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { config, content } = await getHomeData();
  // In local development with no reachable database, show the sample projects so the
  // layout can be worked on. Production never shows sample content.
  const projects = content.projects.length === 0 && process.env.NODE_ENV === 'development'
    ? sampleProjects
    : content.projects;

  return (
    <main>
      <WorkReel config={config} projects={projects} />
    </main>
  );
}
