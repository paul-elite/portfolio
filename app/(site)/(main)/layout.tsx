import { getSiteConfig } from '@/lib/content-service';
import SiteShell from '@/components/home/SiteShell';

export const revalidate = 60;

// The section pages (projects, writings, illustration, interaction) keep the
// three-column shell with its persistent left navigation. The landing page
// sits outside this group and renders its own single-column layout.
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  return <SiteShell config={config}>{children}</SiteShell>;
}
