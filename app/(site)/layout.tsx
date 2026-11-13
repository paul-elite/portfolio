import { getSiteConfig } from '@/lib/content-service';
import SiteShell from '@/components/home/SiteShell';

export const revalidate = 60;

// Every public page shares this shell, so the left navigation stays mounted across page changes.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  return <SiteShell config={config}>{children}</SiteShell>;
}
