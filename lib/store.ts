import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { hasSupabaseConfig, supabase } from './supabase';

// Store data: templates for sale and their orders. All reads and writes go through the service role
// on the server; the tables have row level security on with no public policies.

export interface StoreProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string | null;
  file_path: string | null;
  price_amount: string;
  price_currency: string;
  bachs_product_id: string | null;
  published: boolean;
}

export interface StoreOrder {
  id: string;
  product_id: string;
  status: 'pending' | 'paid' | 'expired' | 'review';
  amount: string;
  currency: string;
  access_token: string;
  idempotency_key: string;
  checkout_id: string | null;
  email: string | null;
  paid_at: string | null;
}

const PUBLIC_FIELDS = 'id, slug, title, description, cover, price_amount, price_currency';

export async function listProducts(): Promise<Omit<StoreProduct, 'file_path' | 'bachs_product_id' | 'published'>[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase.from('store_products').select(PUBLIC_FIELDS).eq('published', true).order('sort_order').order('created_at', { ascending: false });
  if (error) { console.error('store: list products', error.message); return []; }
  return data ?? [];
}

export async function getProduct(slug: string): Promise<StoreProduct | null> {
  if (!hasSupabaseConfig) return null;
  const { data } = await supabase.from('store_products').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  return data;
}

export async function getProductById(id: string): Promise<StoreProduct | null> {
  const { data } = await supabase.from('store_products').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function createOrder(product: StoreProduct): Promise<StoreOrder> {
  const { data, error } = await supabase
    .from('store_orders')
    .insert({
      product_id: product.id,
      amount: product.price_amount,
      currency: product.price_currency,
      access_token: randomBytes(32).toString('base64url'),
      idempotency_key: randomUUID(),
    })
    .select('*')
    .single();
  if (error || !data) throw new Error(`store: create order: ${error?.message}`);
  return data;
}

export async function setOrderCheckout(orderId: string, checkoutId: string) {
  await supabase.from('store_orders').update({ checkout_id: checkoutId }).eq('id', orderId);
}

export async function getOrderByToken(token: string): Promise<StoreOrder | null> {
  if (!token || token.length < 32) return null;
  const { data } = await supabase.from('store_orders').select('*').eq('access_token', token).maybeSingle();
  return data;
}

export async function findOrder(checkoutId?: string, reference?: string): Promise<StoreOrder | null> {
  if (checkoutId) {
    const { data } = await supabase.from('store_orders').select('*').eq('checkout_id', checkoutId).maybeSingle();
    if (data) return data;
  }
  if (reference && /^[0-9a-f-]{36}$/i.test(reference)) {
    const { data } = await supabase.from('store_orders').select('*').eq('id', reference).maybeSingle();
    if (data) return data;
  }
  return null;
}

/** Record a webhook event id; false when it was already processed */
export async function claimEvent(id: string, type: string): Promise<boolean> {
  const { error } = await supabase.from('store_webhook_events').insert({ id, type });
  if (!error) return true;
  if (error.code === '23505') return false; // duplicate delivery
  throw new Error(`store: record event: ${error.message}`);
}

export async function releaseEvent(id: string) {
  await supabase.from('store_webhook_events').delete().eq('id', id);
}

export async function updateOrder(id: string, fields: Partial<StoreOrder> & { charge_id?: string }, onlyFrom?: StoreOrder['status'][]) {
  let q = supabase.from('store_orders').update(fields).eq('id', id);
  if (onlyFrom) q = q.in('status', onlyFrom);
  const { error } = await q;
  if (error) throw new Error(`store: update order: ${error.message}`);
}

/** A short-lived link to the purchased file in the private bucket */
export async function signedDownloadUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('store-files').createSignedUrl(filePath, 60, { download: true });
  if (error) { console.error('store: sign download', error.message); return null; }
  return data.signedUrl;
}

export function siteUrl(): string {
  return (process.env.SITE_URL || 'https://work.paulelite.me').replace(/\/$/, '');
}

export function formatPrice(amount: string | number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: Number(amount) % 1 ? 2 : 0 }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}
