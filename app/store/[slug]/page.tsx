import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatPrice, getProduct } from '@/lib/store';
import BuyButton from '../BuyButton';

export const revalidate = 60;

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.title, description: product.description.slice(0, 160) } : {};
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const price = formatPrice(product.price_amount, product.price_currency);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[880px] px-4 pt-24 pb-24 md:pt-40">
        <Link href="/store" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">← Templates</Link>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
            {product.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.cover} alt={product.title} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{product.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{price}</p>
            <div className="mt-6 space-y-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</div>
            <div className="mt-8">
              {product.file_path ? <BuyButton slug={product.slug} label={`Buy for ${price}`} /> : <p className="text-sm text-gray-400">Coming soon</p>}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">Secure checkout by Bachs: card, bank transfer, mobile money, USDT or USDC. Prices in {product.price_currency}; you can pay in your local currency.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
