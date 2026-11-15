'use client';

import { useEffect, useState } from 'react';

/* The footer's live local-time line, à la benji.org: the author's own local
   time and city — Abuja, Nigeria (Africa/Lagos), shown to every visitor. */
const TIME_ZONE = 'Africa/Lagos';
const PLACE = 'Abuja, Nigeria';

export default function LocalClock() {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const t = new Date()
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: TIME_ZONE,
        })
        .replace(' ', '')
        .toLowerCase();
      setLabel(`${t} in ${PLACE}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{label || ' '}</span>;
}
