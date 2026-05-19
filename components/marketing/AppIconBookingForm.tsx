'use client';

import { useState } from 'react';

const projectTypes = ['iOS app', 'Android app', 'macOS app', 'Web app', 'Full icon set'];
const timelineOptions = ['This week', '1-2 weeks', 'This month', 'Exploring'];

interface BookingResponse {
  success: boolean;
  emailed: boolean;
  mailtoUrl?: string;
}

export default function AppIconBookingForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'fallback' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/book-app-icon-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as BookingResponse;

      if (!response.ok || !data.success) {
        throw new Error('Unable to send request');
      }

      if (data.emailed) {
        setStatus('sent');
        setMessage('Request sent. I will reply with a time shortly.');
        form.reset();
        return;
      }

      setStatus('fallback');
      setMessage('Email service is not configured yet, so I opened a prepared email instead.');
      if (data.mailtoUrl) {
        window.location.href = data.mailtoUrl;
      }
    } catch {
      setStatus('error');
      setMessage('Something did not send. Email me directly and I will pick it up.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Project type" name="projectType" options={projectTypes} />
        <Select label="Timeline" name="timeline" options={timelineOptions} />
      </div>

      <Field label="App or company name" name="company" autoComplete="organization" />

      <label className="grid gap-2">
        <span className="text-sm font-medium text-gray-700">What should the icon communicate?</span>
        <textarea
          name="notes"
          rows={5}
          className="min-h-32 rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition-colors focus:border-gray-950"
          placeholder="A few words about the product, audience, mood, or links."
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-md bg-gray-950 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending...' : 'Request a call'}
      </button>

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
          {message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none transition-colors focus:border-gray-950"
      />
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select
        name={name}
        className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none transition-colors focus:border-gray-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
