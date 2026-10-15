import { NextResponse } from 'next/server';
import { getOrderByToken, getProductById, signedDownloadUrl } from '@/lib/store';

// The purchased file: only for a paid order, handed out as a one-minute signed URL to the private bucket
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (order.status !== 'paid') return NextResponse.json({ error: 'payment not confirmed' }, { status: 403 });

  const product = await getProductById(order.product_id);
  const url = product?.file_path ? await signedDownloadUrl(product.file_path) : null;
  if (!url) return NextResponse.json({ error: 'file unavailable' }, { status: 500 });

  return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
