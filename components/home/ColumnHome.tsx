import Link from 'next/link';
import type { PortfolioContent, SiteConfig } from '@/lib/content-model';

// Single-column home: avatar, name and role, four numbered sections switched by ?section=.
export type HomeSection = 'work' | 'explorations' | 'writing' | 'about';
const SECTIONS: { id: HomeSection; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'explorations', label: 'Explorations' },
  { id: 'writing', label: 'Writing' },
  { id: 'about', label: 'About' },
];

const day = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function Row({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <li>
      <Link href={href} className="group flex flex-col gap-0.5">
        <span className="w-fit text-black underline decoration-zinc-100 decoration-2 underline-offset-2 transition-[text-decoration-color] duration-150 group-hover:decoration-zinc-300">{title}</span>
        {meta && <span className="text-zinc-400 tabular-nums">{meta}</span>}
      </Link>
    </li>
  );
}

export default function ColumnHome({ config, content, section }: { config: SiteConfig; content: PortfolioContent; section: HomeSection }) {
  const shots = [
    ...content.illustrations.map((i) => ({ src: i.thumbnail || i.avatar, alt: i.title })),
    ...content.projects.flatMap((p) => [p.preview, ...(p.previewImages ?? [])].map((src) => ({ src, alt: p.title }))),
  ].filter((s): s is { src: string; alt: string } => Boolean(s.src));
  const links = Object.entries(config.social ?? {}).filter(([, v]) => v);

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-24 text-[15px] leading-[1.5] text-black antialiased">
      <Link href="/" aria-label="Go to the homepage" className="mb-8 block size-8">
        {config.avatar ? <img src={config.avatar} alt={config.name} className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" /> : <span className="grid size-8 place-items-center rounded-full bg-zinc-900 text-white">{config.name?.[0]}</span>}
      </Link>
      <h1 className="font-medium">{config.name}</h1>
      <p className="text-pretty">{config.title}</p>

      <nav className="mt-14 flex gap-6 overflow-x-auto" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <Link key={s.id} href={s.id === 'work' ? '/' : `/?section=${s.id}`} aria-current={section === s.id ? 'page' : undefined}
            className={`shrink-0 border-b-2 pb-1 transition-[color,border-color] duration-150 ${section === s.id ? 'border-zinc-100 text-zinc-500' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
            {s.label}<sup className="ml-0.5 text-[10px]">{i + 1}</sup>
          </Link>
        ))}
      </nav>

      <section className="mt-14">
        {section === 'work' && (
          <ul className="flex flex-col gap-6">{content.projects.map((p) => <Row key={p.id} href={`/project/${p.slug}`} title={p.title} meta={p.year || p.role} />)}</ul>
        )}
        {section === 'writing' && (
          <ul className="flex flex-col gap-6">{content.writings.map((w) => <Row key={w.id} href={w.link || `/writing/${w.slug}`} title={w.title} meta={day(w.date)} />)}</ul>
        )}
        {section === 'explorations' && (
          shots.length ? (
            <div className="grid gap-6 md:-mx-28 md:grid-cols-2">
              {shots.map((s, i) => <img key={s.src + i} src={s.src} alt={s.alt} loading="lazy" className="w-full bg-zinc-50 object-cover outline outline-1 -outline-offset-1 outline-black/10" />)}
            </div>
          ) : <p className="text-zinc-400">Explorations are on their way.</p>
        )}
        {section === 'about' && (
          <div className="flex flex-col gap-8">
            {(config.bio || '').split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i} className="text-pretty">{para}</p>)}
            {links.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-zinc-400">Connect</span>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {links.map(([k, v]) => <li key={k}><a href={k === 'email' && !String(v).startsWith('mailto:') ? `mailto:${v}` : String(v)} className="capitalize underline decoration-zinc-100 decoration-2 underline-offset-2 hover:decoration-zinc-300">{k}</a></li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
