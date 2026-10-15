import Link from 'next/link';
import type { Metadata } from 'next';
import { formatPrice, listProducts } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = { title: 'Templates', description: 'Design templates and resources.' };

export default async function StorePage() {
  const products = await listProducts();
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[880px] px-4 pt-24 pb-24 md:pt-40">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">← Paul Elite</Link>
        <h1 className="mt-6 text-xl font-semibold text-gray-900">Templates</h1>
        <p className="mt-1 max-w-[460px] text-sm leading-relaxed text-gray-500">Files I use in my own work, ready for yours. Pay by card, bank transfer, mobile money or stablecoin; the download is yours straight after.</p>

        {products.length === 0 ? (
          <p className="mt-16 text-sm text-gray-400">Nothing for sale just yet.</p>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {products.map(p => (
              <li key={p.id}>
                <Link href={`/store/${p.slug}`} className="group block focus-visible:outline-none">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 transition-transform group-hover:scale-[0.99] group-focus-visible:ring-2 group-focus-visible:ring-gray-400">
                    {p.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-gray-900">{p.title}</span>
                    <span className="text-sm text-gray-500">{formatPrice(p.price_amount, p.price_currency)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
