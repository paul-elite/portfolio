'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getVisitorId() {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const track = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            visitorId: getVisitorId(),
          }),
        });
      } catch {
        // Silently fail
      }
    };

    track();
  }, [pathname]);

  return null;
}
