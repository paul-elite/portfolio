'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PortfolioTab } from '@/lib/portfolio-options';
import { usePreferences } from './PreferenceProvider';

interface NavigationItem {
  key: PortfolioTab;
  label: string;
  icon: ReactNode;
}

interface PortfolioNavigationProps {
  items: NavigationItem[];
  activeTab: PortfolioTab;
  onChange: (tab: PortfolioTab) => void;
  radialTrigger: ReactNode;
}

export default function PortfolioNavigation({ items, activeTab, onChange, radialTrigger }: PortfolioNavigationProps) {
  const { preferences } = usePreferences();
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return items;
    return items.filter((item) => item.label.toLowerCase().includes(cleanQuery));
  }, [items, query]);

  useEffect(() => {
    if (!commandOpen) return;

    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCommandOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  if (preferences.navigationStyle === 'standard') {
    return (
      <nav className="portfolio-tabs relative z-40 ml-[52px] mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:ml-0 md:gap-x-4" aria-label="Portfolio sections">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`font-normal transition-all ${
              activeTab === item.key
                ? 'text-[var(--experience-text)]'
                : 'text-[var(--experience-muted)] hover:text-[var(--experience-text)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  if (preferences.navigationStyle === 'command') {
    return (
      <>
        <nav className="portfolio-tabs relative z-40 ml-[52px] mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:ml-0 md:gap-x-4" aria-label="Portfolio command navigation">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--experience-surface)] px-3 py-1.5 text-sm font-normal text-[var(--experience-text)] transition-colors hover:bg-[var(--experience-accent-soft)]"
            style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--experience-card)] text-[var(--experience-accent)]">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <path d="M7 12a5 5 0 1 1 3.5-1.45L14 14" />
              </svg>
            </span>
            Jump to {items.find((item) => item.key === activeTab)?.label}
          </button>
        </nav>

        <AnimatePresence>
          {commandOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close command menu"
                className="fixed inset-0 z-[9998] bg-white/70 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCommandOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Quick jump"
                className="fixed left-4 right-4 top-24 z-[9999] mx-auto max-w-md rounded-[24px] bg-[var(--experience-card)] p-3 text-[var(--experience-text)]"
                style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sections"
                  className="mb-2 w-full rounded-2xl bg-[var(--experience-surface)] px-4 py-3 text-sm outline-none"
                />
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onChange(item.key);
                        setCommandOpen(false);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm hover:bg-[var(--experience-accent-soft)]"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--experience-surface)] text-[var(--experience-accent)]">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <nav className="portfolio-tabs relative z-40 ml-[52px] mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:ml-0 md:gap-x-4" aria-label="Portfolio radial navigation">
      {items.slice(0, 3).map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`font-normal transition-all ${
            activeTab === item.key
              ? 'text-[var(--experience-text)]'
              : 'text-[var(--experience-muted)] hover:text-[var(--experience-text)]'
          }`}
        >
          {item.label}
        </button>
      ))}
      {radialTrigger}
    </nav>
  );
}
