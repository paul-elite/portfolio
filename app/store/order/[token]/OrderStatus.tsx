'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Status = 'pending' | 'paid' | 'expired' | 'review';

// Waits for the payment webhook to confirm the order, then offers the download.
// Polls every 2 seconds for up to 3 minutes; the page can be reloaded or bookmarked at any time.
export default function OrderStatus({ token, initial, slug }: { token: string; initial: Status; slug: string }) {
  const [status, setStatus] = useState<Status>(initial);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (status !== 'pending') return;
    const started = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - started > 180_000) { clearInterval(timer); setGaveUp(true); return; }
      const res = await fetch(`/api/store/orders/${token}`, { cache: 'no-store' }).catch(() => null);
      const data = res?.ok ? await res.json() : null;
      if (data?.status && data.status !== 'pending') { setStatus(data.status); clearInterval(timer); }
    }, 2000);
    return () => clearInterval(timer);
  }, [status, token]);

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 p-5" aria-live="polite">
      {status === 'paid' && (
        <>
          <p className="text-sm font-medium text-gray-900">Payment confirmed. Thank you!</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Download your files below. This page is your link to them, so bookmark it if you’d like to download again later.</p>
          <a href={`/api/store/download/${token}`} className="mt-5 inline-flex h-10 items-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:opacity-90">Download</a>
        </>
      )}
      {status === 'pending' && (
        <>
          <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
            {!gaveUp && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" aria-hidden />}
            {gaveUp ? 'Still waiting for your payment to confirm' : 'Confirming your payment…'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            {gaveUp
              ? 'Bank transfers and some mobile money payments can take a few minutes. Keep this page and reload it later; your download appears here as soon as the payment lands.'
              : 'This usually takes a few seconds. Your download will appear here.'}
          </p>
        </>
      )}
      {status === 'expired' && (
        <>
          <p className="text-sm font-medium text-gray-900">This checkout expired before payment</p>
          <p className="mt-1 text-sm text-gray-500">Nothing was charged. You can start again whenever you’re ready.</p>
          {slug && <Link href={`/store/${slug}`} className="mt-5 inline-flex h-10 items-center rounded-full border border-gray-200 px-5 text-sm text-gray-900 hover:border-gray-300">Back to the template</Link>}
        </>
      )}
      {status === 'review' && (
        <>
          <p className="text-sm font-medium text-gray-900">We received a payment that needs a quick check</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">The amount didn’t match this order exactly, so I’m reviewing it by hand. Keep this page; your download will appear here once it’s sorted.</p>
        </>
      )}
    </div>
  );
}
