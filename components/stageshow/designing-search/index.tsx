import { Bar, Button, Icon, Popover, Stage, Swap, Text, Window, type Act, type Layout } from '../kit'
import './search.css'

// Designing Search, a feature card (400 × 300). Story: suggestions that say
// what they'll do. A shopper clicks into a store's search and types "lounge";
// suggestions drop under the field, each ending in what picking it does:
// "Search" runs a query, "Open" goes straight to a product. Typing "ch"
// refines the list in place. They pick the product row, the page becomes the
// chair, and the payoff holds. The field's clear button is the loop's caused
// reset: the query goes and the collection comes back.
//
// Layout: pinned, bottom bleed (static-card's card recipe). The window is
// inset left, right and top and runs off the bottom; only the collection's
// filler is cropped. Real words only on the query, the three suggestions,
// their actions and the product it opens.

type Page = 'grid' | 'product'
type S = {
  focus: boolean
  q: string
  menu: boolean
  // Which result set each row shows, so the refine ripples down the list
  rows: number[]
  page: Page
}
const initial: S = { focus: false, q: '', menu: false, rows: [0, 0, 0], page: 'grid' }

type Sug = { kind: 'query' | 'product'; label: string; match: string; action: 'Search' | 'Open' }
// For "lounge", then for "lounge ch"; the product row keeps its place so the
// pick doesn't chase a moving target
const SUGGESTIONS: Sug[][] = [
  [
    { kind: 'query', label: 'lounge chair', match: 'lounge', action: 'Search' },
    { kind: 'product', label: 'Lounge chair, oak', match: 'Lounge', action: 'Open' },
    { kind: 'query', label: 'lounge sofa', match: 'lounge', action: 'Search' },
  ],
  [
    { kind: 'query', label: 'lounge chair', match: 'lounge ch', action: 'Search' },
    { kind: 'product', label: 'Lounge chair, oak', match: 'Lounge ch', action: 'Open' },
    { kind: 'query', label: 'lounge chairs outdoor', match: 'lounge ch', action: 'Search' },
  ],
]

const REST = { wide: { x: 300, y: 250 }, compact: { x: 260, y: 250 } }

// A person's typing: uneven, but the same every loop
const RHYTHM = [1.1, 0.8, 1.3, 0.9, 1.5, 1, 0.8, 1.2]

async function typeOn(a: Act<S>, from: string, to: string) {
  for (let i = from.length + 1; i <= to.length; i++) {
    await a.set({ q: to.slice(0, i) })
    await a.wait(110 * RHYTHM[i % RHYTHM.length])
  }
}

async function script(a: Act<S>) {
  const rest = REST[a.layout]
  await a.wait(800)

  // 1. Into the search field
  a.mark('search')
  await a.click({ at: 'field', x: 0.55, y: 0.5 })
  await a.set({ focus: true })
  await a.wait(300)

  // 2. "lounge": suggestions drop, each saying what it will do
  await typeOn(a, '', 'lounge')
  await a.wait(140)
  await a.set({ menu: true })
  await a.wait(1100)

  // 3. "ch": the list refines in place, top row first
  a.mark('refine')
  await typeOn(a, 'lounge', 'lounge ch')
  await a.wait(120)
  await a.stagger([0, 1, 2], (i) => a.set((s) => ({ rows: s.rows.map((r, j) => (j === i ? 1 : r)) })), 60)
  await a.wait(900)

  // 4. Pick the product: "Open" goes straight to it
  a.mark('pick')
  await a.move({ at: 'product', x: 0.62, y: 0.5 })
  await a.wait(450)
  await a.click()
  await a.set({ menu: false })
  await a.wait(140)
  await a.set({ page: 'product', focus: false, q: 'Lounge chair, oak' })
  a.mark('product')
  await a.move({ x: rest.x, y: rest.y })
  await a.wait(600)
  // The menu has faded; its rows go back now, unseen, so nothing resets at the clear
  await a.snap({ rows: [0, 0, 0] })
  await a.wait(2000)

  // 5. Clear the field: the collection comes back
  a.mark('clear')
  await a.click('clear')
  await a.set({ q: '', page: 'grid' })
  await a.move(rest)
  await a.wait(700)
}

export default function DesigningSearch() {
  return (
    <Stage
      width={400}
      height={300}
      compact={{ below: 400, width: 358, height: 300 }}
      initial={initial}
      poster={{ ...initial, focus: true, q: 'lounge ch', menu: true, rows: [1, 1, 1] }}
      script={script}
      greys="warm"
      cursor={{ at: REST }}
      className="ds-card"
    >
      {(s, _rect, layout) => <Scene s={s} layout={layout} />}
    </Stage>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  const compact = layout === 'compact'
  const typed = s.q.length > 0
  return (
    <Window className="ds-window">
      <div className="ds-page">
        <div className="ds-search">
          <div className="ds-field" data-target="field" data-cursor="ibeam" data-focus={s.focus || undefined}>
            <Icon name="search" size={14} className="ds-field__icon" />
            <span className="ds-field__text">
              <span className="ds-ph" data-hide={typed || undefined}>
                Search the store
              </span>
              <span className="ds-q" data-show={typed || undefined} data-snap>
                {s.q}
                <span className="ds-caret" data-on={s.focus || undefined} data-typing={(s.focus && s.q.length > 0 && s.q.length < 9) || undefined} />
              </span>
            </span>
            <span className="ds-clear" data-target="clear" data-cursor="hand" data-show={(typed && !s.focus) || undefined}>
              <Icon name="close" size={12} />
            </span>
          </div>

          <Popover show={s.menu} origin="top center" className="ds-menu">
            {s.rows.map((set, i) => {
              const sg = SUGGESTIONS[set][i]
              return (
                <div key={i} className="ds-sug" data-target={sg.kind === 'product' ? 'product' : undefined} data-cursor="hand">
                  <Swap id={`${set}-${i}`} duration={340} className="ds-swap" style={{ width: '100%' }}>
                    <span className="ds-sug__inner">
                      {sg.kind === 'product' ? <span className="ds-swatch" data-tone="oak" /> : <Icon name="search" size={14} className="ds-sug__icon" />}
                      <span className="ds-sug__label">
                        <b>{sg.label.slice(0, sg.match.length)}</b>
                        {sg.label.slice(sg.match.length)}
                      </span>
                      <span className="ds-sug__action">{sg.action}</span>
                    </span>
                  </Swap>
                </div>
              )
            })}
          </Popover>
        </div>

        <div className="ds-pages" data-crop>
          <div className="ds-pg" data-show={s.page === 'grid' || undefined}>
            <Collection compact={compact} />
          </div>
          <div className="ds-pg" data-show={s.page === 'product' || undefined}>
            <Product />
          </div>
        </div>
      </div>
    </Window>
  )
}

/* The store's collection: filler, the thing the search narrows */
function Collection({ compact }: { compact: boolean }) {
  const tiles: ('oak' | 'linen' | 'charcoal' | 'sage')[] = compact ? ['linen', 'oak', 'charcoal', 'sage'] : ['linen', 'oak', 'charcoal', 'sage', 'linen', 'oak']
  return (
    <div className="ds-grid">
      {tiles.map((t, i) => (
        <div key={i} className="ds-tile">
          <span className="ds-tile__img" data-tone={t} />
          <Bar w={[64, 52, 70, 46, 58, 66][i]} h={6} tone={3} />
          <Bar w={28} h={6} tone={2} />
        </div>
      ))}
    </div>
  )
}

/* The payoff: the product the suggestion promised to open */
function Product() {
  return (
    <div className="ds-product">
      <span className="ds-product__img" data-tone="oak" />
      <div className="ds-product__info">
        <Text className="ds-product__title">Lounge chair, oak</Text>
        <Text className="ds-product__price">$640</Text>
        <Bar w={96} h={6} tone={2} />
        <Bar w={72} h={6} tone={2} />
        <Button className="ds-product__add">Add to cart</Button>
      </div>
    </div>
  )
}
