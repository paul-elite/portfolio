import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSession, sameAmount, verifyWebhook } from '@/lib/bachs';
import { claimEvent, findOrder, releaseEvent, updateOrder } from '@/lib/store';

// Bachs webhook: the only thing that marks an order paid. Verified on the raw body, applied once per
// event id, and checked against the checkout itself (status, amount, currency) before a file unlocks.
// Register https://work.paulelite.me/api/webhooks/bachs for checkout.completed, collection.succeeded
// and checkout.expired.

const PAYMENT_EVENTS = new Set(['checkout.completed', 'collection.succeeded']);

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: { id?: string; type?: string; data?: Record<string, unknown> };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }); }
  const { id, type, data = {} } = event;
  if (!id || !type) return NextResponse.json({ error: 'missing event id or type' }, { status: 400 });

  // Acknowledge events the store doesn't act on
  if (!PAYMENT_EVENTS.has(type) && type !== 'checkout.expired') return NextResponse.json({ received: true });

  if (!(await claimEvent(id, type))) return NextResponse.json({ received: true, duplicate: true });

  try {
    const checkoutId = typeof data.checkout_id === 'string' ? data.checkout_id : undefined;
    const reference = typeof data.reference === 'string' ? data.reference : undefined;
    const order = await findOrder(checkoutId, reference);
    if (!order) return NextResponse.json({ received: true, ignored: 'no matching order' });

    if (type === 'checkout.expired') {
      // A late payment can still complete the checkout, so only pending orders move to expired
      await updateOrder(order.id, { status: 'expired' }, ['pending']);
      return NextResponse.json({ received: true });
    }

    if (order.status === 'paid') return NextResponse.json({ received: true });

    const checkout = await getCheckoutSession(order.checkout_id || checkoutId || '');
    if (checkout.status !== 'completed') {
      // Not settled yet: let Bachs retry this event later
      await releaseEvent(id);
      return NextResponse.json({ error: 'checkout not completed yet' }, { status: 503 });
    }

    const amount = checkout.amount ?? (typeof data.amount === 'string' ? data.amount : undefined);
    const currency = checkout.currency ?? (typeof data.currency === 'string' ? data.currency : undefined);
    const email = checkout.customer_details?.email ?? checkout.customer?.email ?? null;
    const chargeId = typeof data.charge_id === 'string' ? data.charge_id : undefined;

    if (!amount || !currency || !sameAmount(amount, order.amount) || currency.toUpperCase() !== order.currency.toUpperCase()) {
      // Paid, but not what the order expected: hold it for a manual look rather than unlocking the file
      console.error('store webhook: amount mismatch', { order: order.id, expected: `${order.amount} ${order.currency}`, got: `${amount} ${currency}` });
      await updateOrder(order.id, { status: 'review', email, ...(chargeId ? { charge_id: chargeId } : {}) }, ['pending', 'expired']);
      return NextResponse.json({ received: true, held: true });
    }

    await updateOrder(order.id, { status: 'paid', paid_at: new Date().toISOString(), email, ...(chargeId ? { charge_id: chargeId } : {}) }, ['pending', 'expired', 'review']);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('store webhook', error);
    await releaseEvent(id).catch(() => {});
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }
}
