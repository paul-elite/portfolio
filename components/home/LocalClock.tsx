'use client';

import { useEffect, useState } from 'react';

/* The footer's live local-time line, à la benji.org: "10:12pm in Los Angeles".
   Time and city come from the viewer's own timezone. */
function cityFromTimezone(tz: string) {
  const last = tz.split('/').pop() || tz;
  return last.replace(/_/g, ' ');
}

export default function LocalClock() {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const city = cityFromTimezone(tz);
    const tick = () => {
      const t = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).replace(' ', '').toLowerCase();
      setLabel(`${t} in ${city}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client mismatch.
  return <span suppressHydrationWarning>{label || ' '}</span>;
}
