import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/lib/data';

interface BookingPayload {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  timeline?: string;
  notes?: string;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildEmailText(payload: Required<BookingPayload>) {
  return [
    'New app icon call request',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company/App: ${payload.company || 'Not provided'}`,
    `Project type: ${payload.projectType || 'Not provided'}`,
    `Timeline: ${payload.timeline || 'Not provided'}`,
    '',
    'Notes:',
    payload.notes,
  ].join('\n');
}

function buildMailtoUrl(to: string, payload: Required<BookingPayload>) {
  const subject = `App icon call request from ${payload.name}`;
  const body = buildEmailText(payload);

  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BookingPayload;
    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      company: clean(body.company),
      projectType: clean(body.projectType),
      timeline: clean(body.timeline),
      notes: clean(body.notes),
    };

    if (!payload.name || !isEmail(payload.email) || !payload.notes) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const notifyEmail = process.env.BOOKING_NOTIFY_EMAIL || process.env.CONTACT_EMAIL || siteConfig.social.email;
    const resendApiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.BOOKING_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

    const mailtoUrl = buildMailtoUrl(notifyEmail, payload);

    if (!resendApiKey) {
      return NextResponse.json({
        success: true,
        emailed: false,
        mailtoUrl,
      });
    }

    const emailResponse = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notifyEmail,
        reply_to: payload.email,
        subject: `App icon call request from ${payload.name}`,
        text: buildEmailText(payload),
      }),
    });

    if (!emailResponse.ok) {
      return NextResponse.json({
        success: true,
        emailed: false,
        mailtoUrl,
      });
    }

    return NextResponse.json({ success: true, emailed: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create booking request' }, { status: 500 });
  }
}
