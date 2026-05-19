import type { Metadata } from 'next';
import Link from 'next/link';
import AppIconBookingForm from '@/components/marketing/AppIconBookingForm';

export const metadata: Metadata = {
  title: 'App Icon Design - Elite',
  description: 'Book a focused app icon design call for polished iOS, Android, and web app icons.',
};

const iconSamples = [
  {
    name: 'Tempo',
    bg: 'from-[#ff5a3d] via-[#f47c34] to-[#d9f45f]',
    mark: 'M12 5v14M5 12h14',
  },
  {
    name: 'North',
    bg: 'from-[#0f766e] via-[#16b978] to-[#b6e3ff]',
    mark: 'M12 4l7 16-7-4-7 4 7-16z',
  },
  {
    name: 'Loop',
    bg: 'from-[#2f5bea] via-[#6e7df8] to-[#f4c1ff]',
    mark: 'M7 12a5 5 0 018-4l2 2M17 12a5 5 0 01-8 4l-2-2',
  },
  {
    name: 'Bloom',
    bg: 'from-[#f43f5e] via-[#fb7185] to-[#fef3c7]',
    mark: 'M12 7c3-4 8 1 4 4 4 3-1 8-4 4-3 4-8-1-4-4-4-3 1-8 4-4z',
  },
];

const process = [
  ['1', 'Direction', 'We choose the strongest visual territory for your product category and audience.'],
  ['2', 'Icon System', 'I design explorations that work at full size, on device, and at tiny notification scale.'],
  ['3', 'Delivery', 'You get export-ready assets, source files, and launch notes for App Store and Play Store.'],
];

export default function AppIconsPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] text-gray-950">
      <section className="min-h-[92vh] px-5 py-6 md:px-8 md:py-8 flex flex-col">
        <nav className="flex items-center justify-between text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-950 transition-colors">
            Elite
          </Link>
          <a href="#book" className="text-gray-950 hover:text-gray-500 transition-colors">
            Book a call
          </a>
        </nav>

        <div className="flex-1 grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-16 max-w-6xl mx-auto w-full py-14 md:py-20">
          <div>
            <p className="text-sm text-gray-500 mb-5">App icon design for products that need to feel memorable before they open.</p>
            <h1 className="max-w-3xl text-5xl md:text-7xl font-semibold leading-[0.95] tracking-normal">
              App icons that earn the tap.
            </h1>
            <p className="mt-7 max-w-xl text-base md:text-lg leading-relaxed text-gray-600">
              Focused icon design for iOS, Android, macOS, and web apps. I help founders and teams turn a product idea into a crisp, ownable launch asset.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#book"
                className="inline-flex h-11 items-center justify-center rounded-md bg-gray-950 px-5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Book a call
              </a>
              <span className="text-sm text-gray-500">15 minutes. No deck required.</span>
            </div>
          </div>

          <div className="relative min-h-[360px] md:min-h-[560px]">
            <div className="absolute inset-0 grid grid-cols-2 gap-4 md:gap-6 content-center">
              {iconSamples.map((icon, index) => (
                <div
                  key={icon.name}
                  className={`aspect-square rounded-[28%] bg-gradient-to-br ${icon.bg} shadow-[0_22px_60px_rgba(15,23,42,0.14)] flex items-center justify-center ${
                    index % 2 === 0 ? 'translate-y-8' : '-translate-y-8'
                  }`}
                >
                  <svg className="w-1/2 h-1/2 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={icon.mark} />
                  </svg>
                  <span className="sr-only">{icon.name} sample icon</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid gap-4 md:grid-cols-3 pb-4">
          {process.map(([step, title, copy]) => (
            <article key={step} className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-400">{step}</p>
              <h2 className="mt-2 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="book" className="px-5 py-16 md:px-8 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[0.8fr_1fr] md:gap-16">
          <div>
            <p className="text-sm text-gray-500 mb-4">Simple booking</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">Tell me what you are launching.</h2>
            <p className="mt-5 text-base leading-relaxed text-gray-600">
              Send a quick request and I will reply with a calendar slot. If the email service is not configured yet, the form opens a prepared email instead.
            </p>
          </div>
          <AppIconBookingForm />
        </div>
      </section>
    </main>
  );
}
