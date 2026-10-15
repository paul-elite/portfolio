import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

// Bachs (bachs.io) payments: hosted checkout sessions, confirmed by signed webhooks.
// Server only: the API key and webhook secret never reach the browser.
// Money is a decimal string ("19.00") with an ISO 4217 currency, never minor units.

const API_BASE = process.env.BACHS_API_BASE || 'https://sandbox-api.bachs.io';

export const hasBachsConfig = Boolean(process.env.BACHS_API_KEY && process.env.BACHS_WEBHOOK_SECRET);

export interface CheckoutSession {
  checkout_id: string;
  checkout_url?: string;
  status: string; // open | completed | expired
  amount?: string;
  currency?: string;
  reference?: string;
  customer?: { id: string; email: string; name?: string } | null;
  customer_details?: { email: string; name?: string } | null;
}

async function bachs<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const key = process.env.BACHS_API_KEY;
  if (!key) throw new Error('BACHS_API_KEY is not set');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.idempotencyKey ? { 'Idempotency-Key': init.idempotencyKey } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Bachs ${init.method || 'GET'} ${path} failed: ${res.status} ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export function createCheckoutSession(input: {
  reference: string;
  amount: string;
  currency: string;
  bachsProductId?: string | null;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}) {
  // A Bachs catalog product when there is one, otherwise a raw amount: exactly one pricing source
  const pricing = input.bachsProductId
    ? { product_cart: [{ product_id: input.bachsProductId, quantity: 1 }] }
    : { pricing: { currency: input.currency, amount: input.amount } };
  return bachs<CheckoutSession>('/v1/checkout-sessions', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: JSON.stringify({
      ...pricing,
      reference: input.reference,
      metadata: input.metadata,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }),
  });
}

export function getCheckoutSession(checkoutId: string) {
  return bachs<CheckoutSession>(`/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`);
}

const TOLERANCE_SECONDS = 300;

const safeEqualHex = (a: string, b: string) => {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
};

/**
 * Verify a webhook delivery against the raw body. Uses X-Bachs-Signature-V2 ("t=…,v1=…", any v1 may match
 * during secret rotation), falling back to X-Bachs-Timestamp + X-Bachs-Signature. HMAC-SHA256 over
 * "{timestamp}.{raw body}", hex encoded; deliveries more than five minutes old are rejected.
 */
export function verifyWebhook(rawBody: string, headers: Headers): boolean {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return false;

  let timestamp: string | null = null;
  let candidates: string[] = [];
  const v2 = headers.get('x-bachs-signature-v2');
  if (v2) {
    const pairs = v2.split(',').map(p => p.trim().split('=', 2) as [string, string]).filter(p => p.length === 2);
    timestamp = pairs.find(([k]) => k === 't')?.[1] ?? null;
    candidates = pairs.filter(([k]) => k === 'v1').map(([, v]) => v);
  } else {
    timestamp = headers.get('x-bachs-timestamp');
    const sig = headers.get('x-bachs-signature');
    if (sig) candidates = [sig];
  }
  if (!timestamp || !candidates.length || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return candidates.some(c => safeEqualHex(expected, c));
}

/** Compare two decimal money strings exactly ("19" equals "19.00") */
export function sameAmount(a: string | number, b: string | number): boolean {
  const cents = (v: string | number) => Math.round(Number(v) * 100);
  return Number.isFinite(Number(a)) && Number.isFinite(Number(b)) && cents(a) === cents(b);
}
