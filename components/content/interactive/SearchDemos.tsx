'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowIcon, ChairThumb, Chip, ClockIcon, DemoFrame, Field, Highlight, LockIcon, SearchIcon, Segmented, inputClass } from './primitives';

// Interactive demos for "Designing Search Interfaces That Help People Find Their Way".
// Each one is self-contained, keyboard usable and works without motion.

const fade = { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: 0.18 } };

function useFade() {
  const reduce = useReducedMotion();
  return reduce ? { initial: false as const } : fade;
}

// ———————————————————————————————————————————————————————————————— 1. Intent

type Intent = 'known' | 'fragment' | 'explore';

export function SearchIntentDemo() {
  const [intent, setIntent] = useState<Intent>('known');
  const f = useFade();
  const query = { known: 'Eames lounge chair', fragment: 'wooden chair with a curved back', explore: 'something comfortable for my reading corner' }[intent];
  return (
    <DemoFrame label="Try it · Same search box, three needs" caption="The results change shape with what the person already knows: confirm a known item, recognise a half-remembered one, or explore options.">
      <Segmented name="Kind of search" value={intent} onChange={setIntent} options={[{ value: 'known', label: 'Knows the item' }, { value: 'fragment', label: 'Remembers a detail' }, { value: 'explore', label: 'Exploring' }]} />
      <div className="mt-3"><Field><span className="text-sm text-gray-900 truncate">{query}</span></Field></div>
      <div className="mt-3 min-h-[188px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={intent} {...f}>
            {intent === 'known' && (
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="flex gap-3">
                  <ChairThumb shape="lounge" tone="#d9c7b0" size={64} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-medium">Exact match</p>
                    <p className="text-sm font-medium text-gray-900">Eames Lounge Chair &amp; Ottoman</p>
                    <p className="text-xs text-gray-500">Walnut, black leather · Herman Miller · SKU HM-670</p>
                    <p className="mt-1 text-sm text-gray-900">₦2,450,000 <span className="text-xs text-emerald-600">· In stock, Lagos</span></p>
                  </div>
                </div>
                <p className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-400">What helps: one confident answer, plus the details that confirm it’s the right one (maker, finish, model).</p>
              </div>
            )}
            {intent === 'fragment' && (
              <div>
                <div className="grid grid-cols-3 gap-2">
                  {[['Bentwood Café', '#e2cfb5', 'dining'], ['Oak Spindle', '#d6c2a3', 'dining'], ['Ash Hoop Back', '#e9dcc8', 'arm']].map(([n, t, s]) => (
                    <div key={n} className="rounded-xl border border-gray-200 p-2">
                      <ChairThumb tone={t} shape={s as 'dining'} size={72} />
                      <p className="mt-1.5 text-xs font-medium text-gray-900 truncate">{n}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded bg-amber-50 px-1 text-[10px] text-amber-700">wood</span>
                        <span className="rounded bg-amber-50 px-1 text-[10px] text-amber-700">curved back</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-400">What helps: images first, with the attributes they described shown on each result, so they can recognise it rather than name it.</p>
              </div>
            )}
            {intent === 'explore' && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Start with a kind of seat</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Reading chairs', 'Armchairs', 'Loveseats', 'Recliners', 'Footstools'].map((c, i) => <Chip key={c} active={i === 0}>{c}</Chip>)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[['Nook Reading Chair', 'Deep seat, high back', '₦420,000', '#cfd8d3', 'arm'], ['Lagos Lounger', 'Low, wide, reclines', '₦380,000', '#d9d2e3', 'lounge']].map(([n, d, p, t, s]) => (
                    <div key={n} className="flex gap-2 rounded-xl border border-gray-200 p-2">
                      <ChairThumb tone={t} shape={s as 'arm'} size={40} />
                      <div className="min-w-0"><p className="text-xs font-medium text-gray-900 truncate">{n}</p><p className="text-[11px] text-gray-500 truncate">{d}</p><p className="text-[11px] text-gray-900">{p}</p></div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-400">What helps: categories and a few strong suggestions to compare, not a long list of literal matches for “comfortable”.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 2. Scope

const PEOPLE = [['Ada Okafor', 'Customer · Lagos'], ['Adaeze Nwosu', 'Customer · Abuja'], ['Tunde Bello', 'Customer · Ibadan'], ['Kemi Adeyemi', 'Customer · Lagos']];
const EVERYTHING: { type: 'Person' | 'Document' | 'Project'; title: string; sub: string }[] = [
  { type: 'Person', title: 'Ada Okafor', sub: 'Customer · Lagos' },
  { type: 'Person', title: 'Adaeze Nwosu', sub: 'Customer · Abuja' },
  { type: 'Document', title: 'Ada onboarding notes', sub: 'Updated 2 days ago by Tunde' },
  { type: 'Project', title: 'Adamawa expansion', sub: '12 tasks · due Nov 30' },
];

export function SearchScopeDemo() {
  const [where, setWhere] = useState<'table' | 'global'>('table');
  const [q, setQ] = useState('ada');
  const f = useFade();
  const tableRows = PEOPLE.filter(([n]) => n.toLowerCase().includes(q.toLowerCase()));
  const globalRows = EVERYTHING.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
  const groups = (['Person', 'Document', 'Project'] as const).map(t => [t, globalRows.filter(r => r.type === t)] as const).filter(([, rs]) => rs.length);
  return (
    <DemoFrame label="Try it · Where the field sits sets expectations" caption="The same query means different things in a table and in the top bar. The placeholder, a scope tag and labelled result types make the difference visible.">
      <Segmented name="Search placement" value={where} onChange={setWhere} options={[{ value: 'table', label: 'Field above the customers table' }, { value: 'global', label: 'Field in the top bar' }]} />
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-700">acme</span>
          <div className={`flex-1 transition-opacity ${where === 'global' ? '' : 'opacity-40'}`}>
            <Field scope={where === 'global' ? 'Everything' : undefined}>
              {where === 'global' ? <input aria-label="Search everything" value={q} onChange={e => setQ(e.target.value)} placeholder="Search people, docs and projects" className={inputClass} /> : <span className="text-sm text-gray-400">Search…</span>}
            </Field>
          </div>
        </div>
        <div className="mt-2.5 rounded-lg bg-white p-2.5 border border-gray-200">
          <div className="flex items-center justify-between"><p className="text-xs font-medium text-gray-900">Customers</p><p className="text-[11px] text-gray-400">{where === 'table' ? `${tableRows.length} of ${PEOPLE.length}` : `${PEOPLE.length}`}</p></div>
          <div className={`mt-2 transition-opacity ${where === 'table' ? '' : 'opacity-40'}`}>
            <Field scope={where === 'table' ? 'This table' : undefined}>
              {where === 'table' ? <input aria-label="Filter customers" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter customers by name" className={inputClass} /> : <span className="text-sm text-gray-400">Filter customers…</span>}
            </Field>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={where} {...f} className="mt-2">
              {where === 'table' ? (
                <ul className="divide-y divide-gray-100">
                  {(tableRows.length ? tableRows : []).map(([n, s]) => <li key={n} className="flex justify-between py-1.5 text-xs"><span className="text-gray-900"><Highlight text={n} query={q} /></span><span className="text-gray-400">{s}</span></li>)}
                  {!tableRows.length && <li className="py-2 text-xs text-gray-400">No customers named “{q}”. This field only looks in this table.</li>}
                </ul>
              ) : (
                <div className="space-y-2">
                  {groups.map(([t, rs]) => (
                    <div key={t}>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{t === 'Person' ? 'People' : `${t}s`}</p>
                      {rs.map(r => <p key={r.title} className="flex justify-between py-1 text-xs"><span className="text-gray-900"><Highlight text={r.title} query={q} /></span><span className="text-gray-400 truncate ml-2">{r.sub}</span></p>)}
                    </div>
                  ))}
                  {!groups.length && <p className="py-2 text-xs text-gray-400">Nothing anywhere matches “{q}”.</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 3. Typeahead

type Option = { kind: 'recent' | 'query' | 'product'; label: string; sub?: string; tone?: string; shape?: 'lounge' | 'office' | 'dining' | 'arm' | 'sofa' };
const RECENT = ['office chairs', 'standing desk'];
const QUERIES = ['office chairs', 'office chair with lumbar support', 'oak dining chairs', 'outdoor chairs', 'lounge chairs', 'reading chair', 'armchairs under ₦300,000'];
const PRODUCTS: Option[] = [
  { kind: 'product', label: 'Ergo Chair Pro', sub: 'Office chairs · ₦185,000', tone: '#d5dbe3', shape: 'office' },
  { kind: 'product', label: 'Eames Lounge Chair', sub: 'Lounge chairs · ₦2,450,000', tone: '#d9c7b0', shape: 'lounge' },
  { kind: 'product', label: 'Oak Spindle Chair', sub: 'Dining chairs · ₦95,000', tone: '#e2cfb5', shape: 'dining' },
  { kind: 'product', label: 'Nook Reading Chair', sub: 'Armchairs · ₦420,000', tone: '#cfd8d3', shape: 'arm' },
  { kind: 'product', label: 'Office Task Stool', sub: 'Office chairs · ₦64,000', tone: '#e3e0d5', shape: 'office' },
];

export function TypeaheadDemo() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [outcome, setOutcome] = useState<Option | null>(null);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [{ title: 'Recent', items: RECENT.map(label => ({ kind: 'recent', label }) as Option) }, { title: 'Popular', items: PRODUCTS.slice(0, 2) }];
    const qs = QUERIES.filter(x => x.includes(t)).slice(0, 3).map(label => ({ kind: 'query', label }) as Option);
    const ps = PRODUCTS.filter(p => p.label.toLowerCase().includes(t) || p.sub!.toLowerCase().includes(t)).slice(0, 3);
    return [{ title: 'Search for', items: qs }, { title: 'Products', items: ps }].filter(g => g.items.length);
  }, [q]);
  const flat = groups.flatMap(g => g.items);

  const choose = (o: Option) => { setOutcome(o); setOpen(false); setActive(-1); if (o.kind !== 'product') setQ(o.label); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(-1, a - 1)); }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (active >= 0 && flat[active]) choose(flat[active]); else if (q.trim()) choose({ kind: 'query', label: q.trim() }); }
  };
  const verb = (o: Option) => (o.kind === 'product' ? 'Open' : 'Search');
  let idx = -1;
  return (
    <DemoFrame label="Try it · Suggestions that say what they’ll do" caption="Recent searches, suggested queries and direct results are grouped and look different. Each row says whether it runs a search or opens a page. Use ↑ ↓ and Enter, or Esc to close.">
      <div className="min-h-[300px]">
      <div className="relative">
        <Field>
          <input
            ref={inputRef} value={q} placeholder="Search chairs, desks, lighting…" className={inputClass}
            role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-label="Search the store"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
            onChange={e => { setQ(e.target.value); setOpen(true); setActive(-1); setOutcome(null); }} onKeyDown={onKey}
          />
          <kbd className="hidden sm:inline rounded border border-gray-200 px-1 text-[10px] text-gray-400">↵</kbd>
        </Field>
        {open && (
          <div id={listId} role="listbox" aria-label="Suggestions" className="absolute inset-x-0 top-full z-10 mt-1 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
            {groups.length === 0 && <p className="px-2 py-2 text-xs text-gray-400">No suggestions. Press Enter to search for “{q}”.</p>}
            {groups.map(g => (
              <div key={g.title} role="group" aria-label={g.title}>
                <p className="px-2 pt-1.5 pb-0.5 text-[10px] uppercase tracking-wider text-gray-400">{g.title}</p>
                {g.items.map(o => {
                  idx += 1; const i = idx;
                  return (
                    <div key={o.kind + o.label} id={`${listId}-${i}`} role="option" aria-selected={active === i}
                      onMouseDown={e => e.preventDefault()} onClick={() => choose(o)} onMouseEnter={() => setActive(i)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 ${active === i ? 'bg-gray-100' : ''}`}>
                      {o.kind === 'product' ? <ChairThumb tone={o.tone} shape={o.shape} size={26} /> : o.kind === 'recent' ? <ClockIcon className="text-gray-400 mx-1.5" /> : <SearchIcon className="text-gray-400 mx-1.5" />}
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${o.kind === 'product' ? 'font-medium text-gray-900' : 'text-gray-700'}`}><Highlight text={o.label} query={q} /></span>
                        {o.sub && <span className="block truncate text-[11px] text-gray-400">{o.sub}</span>}
                      </span>
                      <span className={`flex items-center gap-1 text-[11px] ${active === i ? 'text-gray-600' : 'text-gray-300'}`}>{verb(o)} {o.kind === 'product' ? <ArrowIcon /> : '↵'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 min-h-[44px] rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500" aria-live="polite">
        {outcome ? (outcome.kind === 'product'
          ? <>Opened the <span className="font-medium text-gray-900">{outcome.label}</span> product page directly.</>
          : <>Ran a search for <span className="font-medium text-gray-900">“{outcome.label}”</span>, showing a results page you can filter.</>)
          : <>Type <span className="font-medium text-gray-700">“off”</span> or <span className="font-medium text-gray-700">“chair”</span>, then pick a suggestion to see what happens.</>}
      </div>
      </div>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 4. Recognition

const DOCS = [
  { id: 'a', title: 'Pricing', owner: 'Ada Okafor', updated: 'Updated 2 days ago', kind: 'Doc', excerpt: 'Proposal: the pricing page should lead with the Team plan and show annual savings…', correct: true },
  { id: 'b', title: 'Pricing', owner: 'Tunde Bello', updated: 'Updated Mar 2024', kind: 'Sheet', excerpt: 'Q1 pricing experiments, raw data. Superseded by the 2026 proposal.', correct: false },
  { id: 'c', title: 'Notes', owner: 'Kemi Adeyemi', updated: 'Updated last week', kind: 'Doc', excerpt: '…we agreed to revisit pricing after the launch, see Ada’s proposal.', correct: false },
];

export function RecognitionDemo() {
  const [mode, setMode] = useState<'bare' | 'context'>('bare');
  const [picked, setPicked] = useState<string | null>(null);
  const f = useFade();
  const pick = DOCS.find(d => d.id === picked);
  return (
    <DemoFrame label="Try it · Find the current pricing proposal" caption="With titles only, two results are identical and the third looks unrelated. Owner, date, type and the matching sentence let you choose without opening anything.">
      <Segmented name="Result detail" value={mode} onChange={v => { setMode(v); setPicked(null); }} options={[{ value: 'bare', label: 'Title only' }, { value: 'context', label: 'With context' }]} />
      <div className="mt-3"><Field><span className="text-sm text-gray-900">pricing</span></Field></div>
      <ul className="mt-2 space-y-1.5">
        {DOCS.map(d => (
          <li key={d.id}>
            <button type="button" onClick={() => setPicked(d.id)} aria-pressed={picked === d.id}
              className={`w-full rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400 ${picked === d.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{mode === 'bare' ? d.title : <Highlight text={d.title} query="pricing" />}</span>
                {mode === 'context' && <span className="rounded bg-gray-100 px-1 text-[10px] text-gray-500">{d.kind}</span>}
              </span>
              {mode === 'context' && (
                <motion.span {...f} className="block">
                  <span className="block text-[11px] text-gray-400">{d.owner} · {d.updated}</span>
                  <span className="mt-0.5 block text-xs text-gray-600"><Highlight text={d.excerpt} query="pricing" /></span>
                </motion.span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 min-h-[20px] text-xs" aria-live="polite">
        {pick && (pick.correct ? <span className="text-emerald-600">That’s the one: Ada’s current proposal.</span> : <span className="text-gray-500">Not quite. {pick.id === 'b' ? 'That’s last year’s raw data.' : 'That only mentions pricing in passing.'} {mode === 'bare' && 'Hard to tell from a title, isn’t it?'}</span>)}
      </p>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 5. Filters vs sort

type Area = 'Yaba' | 'Surulere' | 'Lekki' | 'Ikeja';
const FLATS: { name: string; area: Area; beds: number; price: number; added: number }[] = [
  { name: 'Herbert Macaulay mini flat', area: 'Yaba', beds: 1, price: 85000, added: 3 },
  { name: 'Sabo 2-bed apartment', area: 'Yaba', beds: 2, price: 150000, added: 1 },
  { name: 'Akoka studio', area: 'Yaba', beds: 1, price: 70000, added: 9 },
  { name: 'Bode Thomas 2-bed', area: 'Surulere', beds: 2, price: 120000, added: 5 },
  { name: 'Adeniran Ogunsanya 3-bed', area: 'Surulere', beds: 3, price: 210000, added: 2 },
  { name: 'Ojuelegba room & parlour', area: 'Surulere', beds: 1, price: 60000, added: 12 },
  { name: 'Admiralty Way 2-bed', area: 'Lekki', beds: 2, price: 450000, added: 4 },
  { name: 'Chevron 3-bed terrace', area: 'Lekki', beds: 3, price: 600000, added: 7 },
  { name: 'Ikate mini flat', area: 'Lekki', beds: 1, price: 180000, added: 6 },
  { name: 'Allen Avenue 2-bed', area: 'Ikeja', beds: 2, price: 230000, added: 8 },
  { name: 'Opebi 1-bed', area: 'Ikeja', beds: 1, price: 95000, added: 10 },
  { name: 'GRA 3-bed duplex', area: 'Ikeja', beds: 3, price: 550000, added: 11 },
];
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function FiltersDemo() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [budget, setBudget] = useState<0 | 100000 | 250000>(0);
  const [beds, setBeds] = useState<0 | 1 | 2 | 3>(0);
  const [sort, setSort] = useState<'relevant' | 'price' | 'new'>('relevant');
  const reduce = useReducedMotion();
  const results = FLATS
    .filter(x => (!areas.length || areas.includes(x.area)) && (!budget || x.price < budget) && (!beds || (beds === 3 ? x.beds >= 3 : x.beds === beds)))
    .sort((a, b) => (sort === 'price' ? a.price - b.price : sort === 'new' ? a.added - b.added : 0));
  const active: { label: string; clear: () => void }[] = [
    ...areas.map(a => ({ label: a, clear: () => setAreas(areas.filter(x => x !== a)) })),
    ...(budget ? [{ label: `Under ${naira(budget)}`, clear: () => setBudget(0) }] : []),
    ...(beds ? [{ label: beds === 3 ? '3+ bedrooms' : `${beds} bedroom${beds > 1 ? 's' : ''}`, clear: () => setBeds(0) }] : []),
  ];
  return (
    <DemoFrame label="Try it · Monthly rent in Lagos" caption="Filters change which apartments qualify; the count moves. Sorting only changes their order; the count stays the same. Active filters stay visible and each can be removed on its own.">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5"><span className="w-16 text-[11px] text-gray-400">Area</span>{(['Yaba', 'Surulere', 'Lekki', 'Ikeja'] as Area[]).map(a => <Chip key={a} active={areas.includes(a)} onClick={() => setAreas(areas.includes(a) ? areas.filter(x => x !== a) : [...areas, a])}>{a}</Chip>)}</div>
        <div className="flex flex-wrap items-center gap-1.5"><span className="w-16 text-[11px] text-gray-400">Budget</span>{([100000, 250000] as const).map(b => <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? 0 : b)}>Under {naira(b)}</Chip>)}</div>
        <div className="flex flex-wrap items-center gap-1.5"><span className="w-16 text-[11px] text-gray-400">Bedrooms</span>{([1, 2, 3] as const).map(b => <Chip key={b} active={beds === b} onClick={() => setBeds(beds === b ? 0 : b)}>{b === 3 ? '3+' : b}</Chip>)}</div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-900" aria-live="polite"><span className="font-medium">{results.length}</span> <span className="text-gray-400">of {FLATS.length} apartments</span></p>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-400">Sort
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400">
            <option value="relevant">Recommended</option><option value="price">Lowest price first</option><option value="new">Newest first</option>
          </select>
        </label>
      </div>
      {active.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {active.map(a => <Chip key={a.label} active onRemove={a.clear}>{a.label}</Chip>)}
          <button type="button" onClick={() => { setAreas([]); setBudget(0); setBeds(0); }} className="text-[11px] text-gray-500 underline underline-offset-2">Clear all</button>
        </div>
      )}
      <motion.ul layout={!reduce} className="mt-2 max-h-[208px] overflow-y-auto divide-y divide-gray-100 pr-1">
        <AnimatePresence initial={false}>
          {results.map(x => (
            <motion.li key={x.name} layout={!reduce} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center justify-between py-1.5 text-xs">
              <span className="min-w-0"><span className="block truncate text-gray-900">{x.name}</span><span className="text-[11px] text-gray-400">{x.area} · {x.beds} bed{x.beds > 1 ? 's' : ''} · added {x.added}d ago</span></span>
              <span className="ml-2 shrink-0 text-gray-900">{naira(x.price)}<span className="text-gray-400">/mo</span></span>
            </motion.li>
          ))}
        </AnimatePresence>
        {results.length === 0 && <li className="py-3 text-xs text-gray-500">No apartments match all of these. Remove a filter above to widen the search.</li>}
      </motion.ul>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 6. Unsuccessful searches

type Failure = 'none' | 'typo' | 'filters' | 'access' | 'error';

function Found({ items, shape }: { items: string[]; shape: 'sofa' | 'arm' }) {
  return (
    <ul className="divide-y divide-gray-100">{items.map(i => <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-900"><ChairThumb size={24} shape={shape} tone="#e5ddd2" />{i}</li>)}</ul>
  );
}

export function EmptyStatesDemo() {
  const [kind, setKind] = useState<Failure>('typo');
  const [fixed, setFixed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState<'budget' | 'today'>('budget');
  const f = useFade();
  useEffect(() => { if (!loading) return; const t = setTimeout(() => { setLoading(false); setFixed(true); }, 900); return () => clearTimeout(t); }, [loading]);
  const query = { none: 'hammock chair', typo: 'armchiar', filters: 'sofa', access: 'board minutes', error: 'reading lamp' }[kind];
  return (
    <DemoFrame label="Try it · Five reasons for “no results”" caption="Each situation gets its own explanation and a next step that actually works. The query is never thrown away.">
      <Segmented name="Situation" value={kind} onChange={k => { setKind(k); setFixed(false); setLoading(false); }} options={[{ value: 'typo', label: 'Typo' }, { value: 'filters', label: 'Filters' }, { value: 'none', label: 'No match' }, { value: 'access', label: 'Access' }, { value: 'error', label: 'Failure' }]} />
      <div className="mt-3"><Field scope={kind === 'filters' && !fixed ? '2 filters' : undefined}><span className="text-sm text-gray-900">{query}</span></Field></div>
      <div className="mt-2 min-h-[132px] rounded-xl border border-dashed border-gray-200 p-3" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={kind + fixed + loading} {...f}>
            {kind === 'typo' && (
              <div>
                <p className="text-xs text-gray-500">Showing results for <span className="font-medium text-gray-900">armchair</span>. <button type="button" onClick={() => setFixed(!fixed)} className="text-gray-500 underline underline-offset-2">{fixed ? 'Back to corrected results' : 'Search for “armchiar” instead'}</button></p>
                <div className="mt-2">{fixed ? <p className="text-xs text-gray-400">No results for “armchiar”. You asked for it exactly, so we didn’t guess.</p> : <Found shape="arm" items={['Nook Reading Chair', 'Ash Hoop Back Armchair', 'Lagos Lounger']} />}</div>
              </div>
            )}
            {kind === 'filters' && (fixed ? (
              <div><p className="text-xs text-gray-500 mb-1">{removed === 'budget' ? '3 sofas deliver today. Removed: Under ₦100,000.' : '1 sofa under ₦100,000. Removed: Delivers today.'} <button type="button" onClick={() => setFixed(false)} className="underline underline-offset-2">Undo</button></p><Found shape="sofa" items={removed === 'budget' ? ['Ikoyi 3-seater · ₦640,000', 'Compact loveseat · ₦210,000', 'Sleeper sofa · ₦380,000'] : ['Futon sofa bed · ₦92,000 · arrives Friday']} /></div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">No sofas under ₦100,000 deliver today</p>
                <p className="mt-0.5 text-xs text-gray-500">Your filters are hiding 3 sofas that match “sofa”.</p>
                <div className="mt-2 flex flex-wrap gap-1.5"><Chip onClick={() => { setRemoved('budget'); setFixed(true); }}>Remove “Under ₦100,000” (3)</Chip><Chip onClick={() => { setRemoved('today'); setFixed(true); }}>Remove “Delivers today” (1)</Chip></div>
              </div>
            ))}
            {kind === 'none' && (
              <div>
                <p className="text-sm font-medium text-gray-900">We don’t sell hammock chairs yet</p>
                <p className="mt-0.5 text-xs text-gray-500">Closest things we have, or get told when they arrive.</p>
                <div className="mt-2 flex flex-wrap gap-1.5"><Chip>Outdoor seating</Chip><Chip>Swing chairs</Chip><Chip active={fixed} onClick={() => setFixed(true)}>{fixed ? 'We’ll email you ✓' : 'Notify me'}</Chip></div>
              </div>
            )}
            {kind === 'access' && (
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900"><LockIcon className="text-gray-400" />2 matches in Finance, which you can’t open</p>
                <p className="mt-0.5 text-xs text-gray-500">Nothing in the spaces you can see. We won’t show the titles, but you can ask for access.</p>
                <div className="mt-2"><Chip active={fixed} onClick={() => setFixed(true)}>{fixed ? 'Request sent to Kemi ✓' : 'Request access'}</Chip></div>
              </div>
            )}
            {kind === 'error' && (loading ? (
              <p className="flex items-center gap-2 text-xs text-gray-500"><span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />Trying again…</p>
            ) : fixed ? <Found shape="arm" items={['Arc Floor Lamp', 'Brass Reading Lamp', 'Clip-on Book Light']} /> : (
              <div>
                <p className="text-sm font-medium text-gray-900">Search didn’t load</p>
                <p className="mt-0.5 text-xs text-gray-500">This is on our side, not your query. Nothing was lost.</p>
                <div className="mt-2"><Chip onClick={() => setLoading(true)}>Try again</Chip></div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 7. Returning to results

const CHAIRS = ['Nook Reading Chair', 'Lagos Lounger', 'Ash Hoop Back', 'Bentwood Café', 'Wingback Classic', 'Rattan Peacock', 'Slingback Lounger', 'Velvet Club Chair', 'Oak Rocking Chair', 'Bouclé Tub Chair'].map((n, i) => ({ n, p: 180000 + ((i * 37) % 9) * 15000 }));

export function ReturnDemo() {
  const [keep, setKeep] = useState(true);
  const [q, setQ] = useState('reading chair');
  const [filter, setFilter] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [lost, setLost] = useState(false);
  const scroller = useRef<HTMLUListElement>(null);
  const saved = useRef(0);
  const back = () => {
    setOpen(null);
    if (keep) { requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollTop = saved.current; }); setLost(false); }
    else { setQ(''); setFilter(false); saved.current = 0; setLost(true); }
  };
  const reset = () => { setQ('reading chair'); setFilter(true); setLost(false); };
  return (
    <DemoFrame label="Try it · Open a result, then go back" caption="Scroll the list, open a chair, then press Back. With context kept, the query, filter and scroll position are where you left them.">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={keep} onChange={e => { setKeep(e.target.checked); if (e.target.checked) setLost(false); }} className="accent-gray-900" />Keep context when going back</label>
        {lost && <button type="button" onClick={reset} className="text-[11px] text-gray-500 underline underline-offset-2">Reset</button>}
      </div>
      <div className="mt-2 h-[236px] overflow-hidden rounded-xl border border-gray-200">
        {open ? (
          <div className="flex h-full flex-col p-3">
            <button type="button" onClick={back} className="flex w-fit items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400" autoFocus>
              <ArrowIcon className="rotate-180" /> Back to results
            </button>
            <div className="mt-3 flex gap-3"><ChairThumb size={72} shape="arm" tone="#cfd8d3" /><div><p className="text-sm font-medium text-gray-900">{open}</p><p className="text-xs text-gray-500">Product page</p></div></div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 p-2">
              <Field><input aria-label="Search chairs" value={q} onChange={e => setQ(e.target.value)} placeholder="Search chairs" className={inputClass} /></Field>
              <div className="mt-1.5 flex gap-1.5">{filter ? <Chip active onRemove={() => setFilter(false)}>Under ₦300,000</Chip> : <Chip onClick={() => setFilter(true)}>Under ₦300,000</Chip>}</div>
            </div>
            {lost && <p className="bg-amber-50 px-3 py-1 text-[11px] text-amber-700">Query, filter and scroll position were lost.</p>}
            <ul ref={scroller} onScroll={e => { saved.current = e.currentTarget.scrollTop; }} className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {CHAIRS.filter(c => !filter || c.p < 300000).map(c => (
                <li key={c.n}><button type="button" onClick={() => setOpen(c.n)} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none">
                  <ChairThumb size={28} shape="arm" tone="#e5ddd2" /><span className="flex-1 text-xs text-gray-900">{c.n}</span><span className="text-xs text-gray-500">{naira(c.p)}</span></button></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DemoFrame>
  );
}

// ———————————————————————————————————————————————————————————————— 8. Evaluating the journey

type Step = { t: string; action: string; signal?: { label: string; tone: 'warn' | 'good' | 'bad' }; note: string };
const SESSIONS: Record<'a' | 'b', { name: string; metric: string; truth: string; steps: Step[] }> = {
  a: {
    name: 'Session A', metric: '3 searches · 2 result clicks', truth: 'Gave up. The analytics look healthy, but the person never found a chair.',
    steps: [
      { t: '0:00', action: 'Searches “comfy chair”', note: 'Their words, not the catalogue’s. Nothing is tagged “comfy”.' },
      { t: '0:09', action: 'Rewrites it to “soft chair”', signal: { label: 'Reformulation', tone: 'warn' }, note: 'Changing the query right away usually means the first results didn’t make sense.' },
      { t: '0:21', action: 'Opens “Soft-close drawer chest”, back after 3 s', signal: { label: 'Pogo-sticking', tone: 'bad' }, note: 'A click that counts as success in a dashboard, but was a wrong turn.' },
      { t: '0:30', action: 'Searches “armchair”, opens one, back after 4 s', signal: { label: 'Pogo-sticking', tone: 'bad' }, note: 'Results still didn’t show what they needed to choose: size, softness, price.' },
      { t: '0:41', action: 'Leaves the site', signal: { label: 'Abandoned', tone: 'bad' }, note: 'Search volume went up by three. Nothing about that is good news.' },
    ],
  },
  b: {
    name: 'Session B', metric: '1 search · 1 result click', truth: 'Found it. Fewer searches here meant search worked.',
    steps: [
      { t: '0:00', action: 'Searches “comfy chair”', note: '“Comfy” is mapped to armchairs, recliners and reading chairs.' },
      { t: '0:04', action: 'Taps the “Reading chairs” category', note: 'A category suggestion turned a vague need into a narrower one.' },
      { t: '0:12', action: 'Adds “Under ₦300,000”', note: 'One filter, visible and easy to remove.' },
      { t: '0:25', action: 'Opens “Nook Reading Chair”, stays 2 min, adds to cart', signal: { label: 'Success', tone: 'good' }, note: 'A long dwell and a next step are stronger evidence than the click itself.' },
    ],
  },
};

export function JourneyDemo() {
  const [s, setS] = useState<'a' | 'b'>('a');
  const [step, setStep] = useState(0);
  const session = SESSIONS[s];
  const tone = { warn: 'bg-amber-50 text-amber-700', good: 'bg-emerald-50 text-emerald-700', bad: 'bg-rose-50 text-rose-700' };
  const f = useFade();
  return (
    <DemoFrame label="Try it · Read a search session" caption="Both sessions start with the same words. Counting searches and clicks can’t tell them apart; watching what happens between them can.">
      <Segmented name="Session" value={s} onChange={v => { setS(v); setStep(0); }} options={[{ value: 'a', label: 'Session A' }, { value: 'b', label: 'Session B' }]} />
      <p className="mt-2 text-[11px] text-gray-400">Dashboard says: <span className="text-gray-600">{session.metric}</span></p>
      <ol className="mt-2 space-y-1">
        {session.steps.map((st, i) => (
          <li key={i}>
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? 'step' : undefined}
              className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400 ${step === i ? 'bg-gray-100' : 'hover:bg-gray-50'} ${i > step ? 'opacity-40' : ''}`}>
              <span className="w-8 shrink-0 font-mono text-[11px] text-gray-400 pt-0.5">{st.t}</span>
              <span className="flex-1 text-xs text-gray-900">{st.action}</span>
              {st.signal && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${tone[st.signal.tone]}`}>{st.signal.label}</span>}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-gray-50 p-3 min-h-[60px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={s + step} {...f} className="flex-1 text-xs text-gray-600">
            {session.steps[step].note}
            {step === session.steps.length - 1 && <span className="mt-1 block font-medium text-gray-900">{session.truth}</span>}
          </motion.p>
        </AnimatePresence>
        <button type="button" onClick={() => setStep(x => (x + 1) % session.steps.length)} className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400">
          {step === session.steps.length - 1 ? 'Replay' : 'Next'}
        </button>
      </div>
    </DemoFrame>
  );
}

export const SEARCH_DEMOS = {
  'search-intent': SearchIntentDemo,
  'search-scope': SearchScopeDemo,
  'search-typeahead': TypeaheadDemo,
  'search-recognition': RecognitionDemo,
  'search-filters': FiltersDemo,
  'search-empty-states': EmptyStatesDemo,
  'search-return': ReturnDemo,
  'search-journey': JourneyDemo,
} as const;
