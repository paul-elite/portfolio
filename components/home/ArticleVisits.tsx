'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import r from './reader.module.css';

const id = (store: Storage, key: string) => {
  let v = store.getItem(key);
  if (!v) { v = crypto.randomUUID(); store.setItem(key, v); }
  return v;
};

// The article's visit count, with the nav. Opening the article logs a visit (once per tab
// session, so reloading doesn't add more), then the count is read back including it.
export default function ArticleVisits() {
  const path = usePathname();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const seen = `visited:${path}`;
        if (!sessionStorage.getItem(seen)) {
          sessionStorage.setItem(seen, '1');
          // Logging the visit may fail (offline, a blocker); the count still loads either way
          await fetch('/api/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path,
              visitorId: id(localStorage, 'visitor_id'),
              sessionId: id(sessionStorage, 'session_id'),
              referrer: document.referrer,
              pageTitle: document.title,
              screen: `${window.screen.width}x${window.screen.height}`,
            }),
          }).catch(() => {});
        }
        const res = await fetch(`/api/read?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
        const { visits: n } = await res.json();
        if (live && typeof n === 'number') setVisits(n);
      } catch {
        // No count is better than a wrong one
      }
    })();
    return () => { live = false; };
  }, [path]);

  if (visits === null) return null;
  return (
    <p className={r.visits}>
      {visits.toLocaleString('en-GB')} {visits === 1 ? 'visit' : 'visits'}
    </p>
  );
}
