'use client';

import { useState } from 'react';

// Starts a Bachs checkout for one template and sends the buyer to the hosted payment page
export default function BuyButton({ slug, label }: { slug: string; label: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const buy = async () => {
    setState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/store/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Couldn’t start checkout. Please try again.');
      window.location.assign(data.url);
    } catch (e) {
      setState('error');
      setMessage(e instanceof Error ? e.message : 'Couldn’t start checkout. Please try again.');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={state === 'loading'}
        className="inline-flex h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
      >
        {state === 'loading' ? 'Opening checkout…' : label}
      </button>
      <p className="mt-2 min-h-[1rem] text-xs text-rose-600" role="alert">{state === 'error' ? message : ''}</p>
    </div>
  );
}
