import Link from 'next/link';
import type { Metadata } from 'next';
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from 'next/font/google';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, Briefcase01Icon, BookOpen01Icon, Mic01Icon } from '@hugeicons/core-free-icons';
import s from './not-found.module.css';

// The 404 (2026-11-27): the site's warm page, a few lines in Paul's voice, and the way out drawn as the
// avatar editor's dark tab bar, nothing selected, each tab a place that does exist.
const sans = Hedvig_Letters_Sans({ subsets: ['latin'], weight: '400', variable: '--nf-sans', display: 'swap' });
const serif = Hedvig_Letters_Serif({ subsets: ['latin'], weight: '400', variable: '--nf-serif', display: 'swap' });

export const metadata: Metadata = { title: 'Page not found - Paul Elite', robots: { index: false } };

const TABS = [
  { href: '/', label: 'Home', icon: Home01Icon },
  { href: '/projects', label: 'Projects', icon: Briefcase01Icon },
  { href: '/writings', label: 'Writings', icon: BookOpen01Icon },
  { href: '/appearances', label: 'Talks', icon: Mic01Icon },
];

export default function NotFound() {
  return (
    <main className={`${sans.variable} ${serif.variable} ${s.page}`}>
      <div className={s.inner}>
        <p className={s.code}>404</p>
        <h1 className={s.title}>This page took a wrong turn.</h1>
        <p className={s.lead}>
          Either the link is broken, or the page moved somewhere else and forgot to tell you. Happens to the best of us.
          Pick a tab and let’s get you back somewhere that actually exists.
        </p>
        <nav className={s.bar} aria-label="Places that exist">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={s.tab}>
              <HugeiconsIcon icon={t.icon} size={22} strokeWidth={1.5} aria-hidden="true" />
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
