import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, hasBachsConfig } from '@/lib/bachs';
import { hasSupabaseConfig } from '@/lib/supabase';
import { createOrder, getProduct, setOrderCheckout, siteUrl } from '@/lib/store';

// Start a purchase: the server picks the product and price, saves an order, opens a Bachs hosted checkout
// and returns its URL. The browser never decides what is charged.
export async function POST(req: NextRequest) {
  if (!hasBachsConfig || !hasSupabaseConfig) {
    return NextResponse.json({ error: 'Payments aren’t available right now.' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug.slice(0, 120) : '';
  const product = slug ? await getProduct(slug) : null;
  if (!product) return NextResponse.json({ error: 'That template isn’t available.' }, { status: 404 });
  if (!product.file_path) return NextResponse.json({ error: 'That template isn’t ready to sell yet.' }, { status: 409 });

  try {
    const order = await createOrder(product);
    const site = siteUrl();
    const session = await createCheckoutSession({
      reference: order.id,
      amount: Number(product.price_amount).toFixed(2),
      currency: product.price_currency,
      bachsProductId: product.bachs_product_id,
      successUrl: `${site}/store/order/${order.access_token}`,
      cancelUrl: `${site}/store/${product.slug}`,
      idempotencyKey: order.idempotency_key,
      metadata: { order_id: order.id, product: product.slug },
    });
    await setOrderCheckout(order.id, session.checkout_id);
    if (!session.checkout_url) throw new Error('Bachs returned no checkout_url');
    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error('store checkout', error);
    return NextResponse.json({ error: 'Couldn’t start checkout. Please try again.' }, { status: 502 });
  }
}
