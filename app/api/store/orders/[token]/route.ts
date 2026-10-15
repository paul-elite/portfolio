import { NextResponse } from 'next/server';
import { getOrderByToken } from '@/lib/store';

// Order status for the order page to poll while the payment confirms
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ status: order.status }, { headers: { 'Cache-Control': 'no-store' } });
}
