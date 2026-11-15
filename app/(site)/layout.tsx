import { Hedvig_Letters_Sans } from 'next/font/google';

export const revalidate = 60;

const hedvig = Hedvig_Letters_Sans({ subsets: ['latin'], weight: '400', display: 'swap' });

// The public site. The landing page renders its own single-column layout here;
// the section pages re-introduce the three-column shell via the (main) group.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={hedvig.className}>{children}</div>;
}
