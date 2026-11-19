import Link from 'next/link';
import { Hedvig_Letters_Serif, Hedvig_Letters_Sans } from 'next/font/google';
import r from './reader.module.css';
import TocRail from './TocRail';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowTurnBackwardIcon } from '@hugeicons/core-free-icons';

// Hedvig serif for the body, Hedvig sans for headers (exposed as CSS vars).
const serif = Hedvig_Letters_Serif({ subsets: ['latin'], weight: '400', variable: '--font-serif', display: 'swap' });
const sans = Hedvig_Letters_Sans({ subsets: ['latin'], weight: '400', variable: '--font-sans', display: 'swap' });

type Toc = { id: string; label: string }[];

export default function ArticleReader({
  title,
  date,
  toc = [],
  children,
}: {
  title: string;
  date?: string;
  toc?: Toc;
  children: React.ReactNode;
}) {
  return (
    <main data-reader className={`${serif.variable} ${sans.variable} ${r.page}`}>
      <div className={r.topbar}>
        <Link href="/" className={r.back}>
          <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={16} strokeWidth={1.5} aria-hidden="true" />
          Back
        </Link>
      </div>
      <div className={r.wrap}>
        <aside className={r.toc}>
          {toc.length > 0 && <TocRail toc={toc} />}
        </aside>
        <article className={r.article}>
          <h1 className={r.title}>{title}</h1>
          {date && <time className={r.date}>{date}</time>}
          {children}
        </article>
      </div>
    </main>
  );
}
