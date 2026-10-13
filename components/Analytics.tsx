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

function getSessionId() {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
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
            sessionId: getSessionId(),
            referrer: document.referrer,
            pageTitle: document.title,
            screen: `${window.screen.width}x${window.screen.height}`,
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
