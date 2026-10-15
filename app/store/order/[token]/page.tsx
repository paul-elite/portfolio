import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOrderByToken, getProductById } from '@/lib/store';
import OrderStatus from './OrderStatus';

export const dynamic = 'force-dynamic';

// The link in this page's address is the buyer's key to their download, so keep it out of search engines
export const metadata: Metadata = { title: 'Your order', robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();
  const product = await getProductById(order.product_id);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[520px] px-4 pt-24 pb-24 md:pt-40">
        <Link href="/store" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">← Templates</Link>
        <h1 className="mt-6 text-xl font-semibold text-gray-900">{product?.title ?? 'Your order'}</h1>
        <OrderStatus token={token} initial={order.status} slug={product?.slug ?? ''} />
      </div>
    </main>
  );
}
