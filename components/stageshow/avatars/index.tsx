'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Stage, type Act } from '../kit'
import { A } from './assets'
import { humanHand } from '../hand'
import '../cursor.css'
import './avatars.css'

/* The Avatars write-up's scenes: the editor's tab bars on their own (no avatar), built from the
   editor (avatars.paulelite.com) and its Figma (Avatars file, frame 113:9122). The art is the
   editor's own: the hair tiles, tab icons and swatches are generated from its library into assets.ts.

   One stack of bars, three ways to show it:
     AvatarsStack   the whole story: Hair rises from behind the main bar, a style is picked,
                    Colour rises from behind Hair (Hair slides down muted, the main bar folds into
                    the tray), green is picked, both bars close, and undo puts the look back
     AvatarsTabs    switching tabs in place: Style → Headwear, a hat goes on (the Colour tile
                    arrives and the bar widens), off again, back to Style
     AvatarsMuted   a still of the three levels: the bar in focus, the muted bar, the tray      */

// The hairstyle tiles are the editor's (the Editable Avatars set, as of 21 Nov 2026): four of the woman's
// styles, regenerated into assets.ts by scripts/avatars-assets.mjs
type Hair = 'ponytail' | 'bob' | 'bun' | 'wavy'
type S = {
  level: 0 | 1 | 2 // the main bar · Hair over it · Colour over Hair
  enter: 'hair' | 'colour' | null // the bar that just rose, so its options slide in
  hair: Hair
  green: boolean
  tab: 'style' | 'wear'
  cap: boolean
  panel?: boolean // every colour at once: the Colour bar grown into a panel over both bars
}
const base: S = { level: 0, enter: null, hair: 'bob', green: false, tab: 'style', cap: false }

// ---- Sizes (px), wide and compact. Bars hug their contents; widths are worked out so the
// stage can ease them like the editor does. ----
type Z = ReturnType<typeof sizes>
const sizes = (compact: boolean) => compact
  ? { tab: 40, opt: 48, gap: 6, more: 48, sw: 30, swGap: 2, tool: 36, padL: 4, padR: 10, colPad: 10, close: 24, sep: 2, hairs: ['ponytail', 'bob', 'bun', 'wavy'] as Hair[], hats: ['hat'] as const, swatches: ['#1a1a1a', '#5a3620', '#50c810', '#f70492'], main: 326 }
  : { tab: 54, opt: 48, gap: 10, more: 48, sw: 32, swGap: 4, tool: 40, padL: 4, padR: 16, colPad: 12, close: 28, sep: 2, hairs: ['ponytail', 'bob', 'bun', 'wavy'] as Hair[], hats: ['hat', 'hijab'] as const, swatches: ['#1a1a1a', '#5a3620', '#a8693f', '#e8b04b', '#50c810', '#f70492'], main: 444 }
// Bars are centred with translateX(-50%): an even width keeps them on whole pixels
const even = (n: number) => Math.ceil(n / 2) * 2
const sum = (n: number, size: number, gap: number) => n * size + Math.max(0, n - 1) * gap
const closeW = (z: Z) => z.gap + z.sep + z.gap + z.close
function hairWidth(s: S, z: Z) {
  const opts = s.tab === 'style' ? z.hairs.length : 1 + z.hats.length
  const colour = s.tab === 'style' || s.cap
  return even(z.padL + sum(opts, z.opt, 9) + (colour ? z.gap + z.more : 0) + closeW(z) + z.padR)
}
const colourWidth = (z: Z) => even(z.colPad + 2 * z.tool + 6 + z.gap + z.sep + z.gap + sum(z.swatches.length, z.sw, z.swGap) + closeW(z) + z.colPad)

const Svg = ({ src, className, ...rest }: { src: string; className?: string } & Record<`data-${string}`, unknown>) => <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: src }} {...rest} />

// ---- Icons the editor draws inline ----
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const Undo = ({ redo }: { redo?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden style={redo ? undefined : { transform: 'scaleX(-1)' }}>
    <path d="M20.99 8h-12a6 6 0 0 0 0 12h4M16.99 4l1.16.88C20.04 6.32 20.99 7.04 20.99 8s-.95 1.68-2.84 3.12L16.99 12" {...LINE} />
  </svg>
)
// The panel's own button (the editor's four arrows turned inward: show fewer)
const Collapse = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 3l6 6m0 0V4.5M9 9H4.5M21 3l-6 6m0 0V4.5M15 9h4.5M3 21l6-6m0 0v4.5M9 15H4.5M21 21l-6-6m0 0v4.5m0-4.5h4.5" {...LINE} />
  </svg>
)
// The panel's colours, as the editor lays them out: twelve hues across, pale at the top to deep at the foot,
// and a row of greys. One cell is the scene's green.
const HUES = [0, 22, 38, 52, 86, 140, 168, 196, 216, 250, 282, 318]
const TONES: [number, number][] = [[80, 92], [82, 84], [84, 75], [84, 64], [88, 51], [84, 37], [82, 25]]
const GRID: string[][] = [
  ...TONES.map(([sat, light]) => HUES.map((h) => `hsl(${h} ${sat}% ${light}%)`)),
  Array.from({ length: 12 }, (_, i) => `hsl(40 4% ${Math.round(100 - i * (100 / 11))}%)`),
]
const GREEN_AT = { row: 4, col: 4 }
const Close = () => <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M18 6 6 18M6 6l12 12" {...LINE} /></svg>
const More = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
    {[6, 12, 18].map((y) => <circle key={y} cx="12" cy={y} r="1.1" fill="currentColor" />)}
  </svg>
)
const None = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
    <circle cx="20" cy="20" r="9" fill="none" stroke="#c8c8c7" strokeWidth="1.5" />
    <path d="M13.6 26.4 26.4 13.6" stroke="#c8c8c7" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
// The shades and all-colours buttons: a ring of dots
const Cluster = ({ fills }: { fills: string[] }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
    {fills.map((f, i) => {
      const a = (i / fills.length) * Math.PI * 2 - Math.PI / 2
      return <circle key={i} cx={14 + Math.cos(a) * 8.5} cy={14 + Math.sin(a) * 8.5} r="3.6" fill={f} />
    })}
  </svg>
)
const SHADES_BLACK = ['#1a1a1a', '#3a3a3a', '#5a5a5a', '#7a7a7a', '#9a9a9a', '#bcbcbc', '#dedede']
const SHADES_GREEN = ['#1c4a06', '#2c6f0a', '#3d950d', '#50c810', '#79da48', '#a5e886', '#d0f4c0']

// ---- The scene ----
// Art that changes (a colour, a tint, a selection) never swaps its markup: every version stays
// mounted in one cell and they crossfade, so nothing snaps or vanishes mid-move.
function Layers({ show, items, className }: { show: number; items: string[]; className?: string }) {
  return (
    <span className={'av-layers' + (className ? ' ' + className : '')} aria-hidden>
      {items.map((src, i) => <Svg key={i} src={src} data-on={i === show || undefined} />)}
    </span>
  )
}

function Scene({ s, compact }: { s: S; compact: boolean }) {
  const z = sizes(compact)
  const hairPos = s.level === 0 ? 'under' : s.level === 1 ? 'top' : 'below'
  const colourPos = s.level === 2 ? 'top' : 'under'
  const mainPos = s.level === 2 ? 'tray' : 'floor'
  const edits = (s.hair !== 'bob' ? 1 : 0) + (s.green ? 1 : 0) + (s.cap ? 1 : 0)
  const hw = hairWidth(s, z)
  const g = s.green ? 1 : 0
  return (
    // Which way the stack is moving, so its bars can go one at a time: opening Colour, the main bar
    // folds, then Hair slides down, then Colour rises; closing it, the same steps run backwards
    <div className="av-scene" data-step={s.level === 2 ? 'open' : s.level === 1 && !s.enter ? 'return' : undefined} data-panel={s.panel || undefined}>
      {/* Every colour: the Colour bar grown into a panel over its own place and the bar's beneath. The bar
          beneath is put away while it is open, with only a sliver of it showing under the panel; the
          panel's one button sits outside it, beside the colours. */}
      <div className="av-panel" data-on={s.panel || undefined} aria-hidden={!s.panel}>
        <span className="av-panel__peek" />
        <div className="av-grid">
          {GRID.map((row, r) => (
            <div key={r} className="av-grid__row">
              {row.map((fill, c) => {
                const green = r === GREEN_AT.row && c === GREEN_AT.col
                return <span key={c} className="av-cell" style={{ background: green ? '#50c810' : fill }} data-target={green ? 'cell-green' : undefined} data-cursor="hand" />
              })}
            </div>
          ))}
        </div>
        <span className="av-panel__close" data-target="collapse" data-cursor="hand"><Collapse /></span>
      </div>

      {/* The tray: the main bar folded under Hair */}
      <div className="av-tray" data-on={s.level === 2 || undefined} style={{ width: hw - 64 }} />

      {/* Colour: rises from behind Hair */}
      <div className="av-bar av-colour" data-pos={colourPos} data-enter={s.enter === 'colour' || undefined} style={{ width: colourWidth(z), '--w': colourWidth(z) + 'px' } as CSSProperties}>
        <div className="av-tools">
          <span className="av-tool" data-cursor="hand">
            <span className="av-layers" aria-hidden>
              <span data-on={!s.green || undefined}><Cluster fills={SHADES_BLACK} /></span>
              <span data-on={s.green || undefined}><Cluster fills={SHADES_GREEN} /></span>
            </span>
          </span>
          <span className="av-tool" data-target="wheel" data-cursor="hand"><Svg className="av-wheel" src={A.wheel.spectrum} /></span>
        </div>
        <span className="av-sep" />
        <div className="av-row av-swatches">
          {z.swatches.map((c) => {
            const on = s.green ? c === '#50c810' : c === '#1a1a1a'
            const d = A.dot[c as keyof typeof A.dot]
            return (
              <span key={c} className="av-swatch" data-target={c === '#50c810' ? 'green' : undefined} data-cursor="hand">
                <Layers show={on ? 1 : 0} items={[d.off, d.on]} />
              </span>
            )
          })}
        </div>
        <span className="av-sep" />
        <span className="av-close" data-target="close-colour" data-cursor="hand"><Close /></span>
      </div>

      {/* Hair's tabs: a small pill over the bar in focus (Figma 156:17484), gone once Hair is under Colour */}
      <div className="av-crumb" data-on={s.level === 1 || undefined} role="tablist">
        <span className="av-crumb__tab" data-on={s.tab === 'style' || undefined} data-target="tab-style" data-cursor="hand">Style</span>
        <span className="av-crumb__tab" data-on={s.tab === 'wear' || undefined} data-target="tab-wear" data-cursor="hand">Headwear</span>
      </div>

      {/* Hair: rises from behind the main bar; slides down muted under Colour */}
      <div className="av-bar av-hair" data-pos={hairPos} data-muted={s.level === 2 || undefined} data-enter={s.enter === 'hair' || undefined} style={{ width: hw, '--w': hw + 'px' } as CSSProperties}>
        {/* Both tabs' rows share one cell (they're the same width); the chosen one crosses in */}
        <div className="av-rows">
          <div className="av-row" data-on={s.tab === 'style' || undefined}>
            {z.hairs.map((h) => (
              <span key={h} className="av-opt" data-on={s.hair === h || undefined} data-target={s.tab === 'style' ? 'hair-' + h : undefined} data-cursor="hand">
                {/* only the chosen style wears the hair colour; the rest stay grey */}
                <Layers show={s.hair === h ? 1 + g : 0} items={[A.hairTiles.black[h], A.hairTiles.ink[h], A.hairTiles.green[h]]} />
              </span>
            ))}
          </div>
          <div className="av-row" data-on={s.tab === 'wear' || undefined}>
            <span className="av-opt" data-on={!s.cap || undefined} data-target={s.tab === 'wear' ? 'hat-none' : undefined} data-cursor="hand"><None /></span>
            {z.hats.map((h) => (
              <span key={h} className="av-opt" data-on={(s.cap && h === 'hat') || undefined} data-target={s.tab === 'wear' ? 'hat-' + h : undefined} data-cursor="hand">
                {/* the chosen hat wears the headwear colour; the rest stay grey */}
                {h === 'hat' ? <Layers show={s.cap ? 1 : 0} items={[A.hatTiles.hat, A.hatTiles.hatOn]} /> : <Svg src={A.hatTiles[h]} />}
              </span>
            ))}
          </div>
        </div>
        {/* No label: the options beside it are unlabelled icons, so the Colour tile matches them */}
        <span className="av-more" aria-label="Colour" data-show={s.tab === 'style' || s.cap || undefined} data-on={s.level === 2 || undefined} data-target="colour" data-cursor="hand">
          <Layers className="av-more__art" show={s.tab === 'wear' ? 2 : g} items={[A.wheel.black, A.wheel.green, A.wheel.pink]} />
        </span>
        <span className="av-sep" />
        <span className="av-close" data-target="close-hair" data-cursor="hand"><Close /></span>
      </div>

      {/* The main bar: the floor */}
      <div className="av-bar av-main" data-pos={mainPos} style={{ width: z.main }}>
        <div className="av-history">
          <span className="av-hist" data-off={!edits || undefined} data-target="undo" data-cursor={edits ? 'hand' : 'pointer'}><Undo /></span>
          <span className="av-hist" data-off data-cursor="pointer"><Undo redo /></span>
        </div>
        <span className="av-groove" />
        <div className="av-cats">
          <span className="av-ind" data-on={s.level > 0 || undefined} />
          {(['face', 'hair', 'outfit', 'color'] as const).map((k) => (
            <span key={k} className="av-cat" data-k={k} data-on={(s.level > 0 && k === 'hair') || undefined} data-target={k === 'hair' ? 'main-hair' : undefined} data-cursor="hand">
              {k === 'hair'
                ? <Layers className="av-cat__art" show={s.level > 0 ? 1 : 0} items={[A.bar.hair, A.bar.hairOn]} />
                : k === 'color'
                  ? <span className="av-cat__art" aria-hidden><span className="av-rainbow" /></span>
                  : <Svg src={A.bar[k]} className="av-cat__art" />}
              {/* (the tile for the background: the editor calls it Frame since 26 Nov 2026) */}
              <span className="av-label">{k === 'color' ? 'Frame' : k[0].toUpperCase() + k.slice(1)}</span>
            </span>
          ))}
        </div>
        <span className="av-groove" />
        <span className="av-hist av-more-btn" data-cursor="hand"><More /></span>
      </div>
    </div>
  )
}

// Rest in the top-right gutter, clear of every target
// Off the stage, past its bottom-right corner: the cursor comes in to act and goes back out, never parked in view
const REST = { wide: { x: 700, y: 410 }, compact: { x: 400, y: 300 } }

// A screen with no hover (a phone): scenes play once as they come into view instead of looping on hover.
// The cursor is the same rounded arrow and hand everywhere, with no tap marks
function useTouch() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(hover: none)')
    const on = () => setTouch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return touch
}

// On hover a scene keeps going for as long as the pointer stays: it holds on its ending, the stack eases
// back to where it began (the bars close the way they always do), and it plays again. Leaving stops it
// at once. Replay and phones play it once.
function whileHovered(script: (a: Act<S>) => Promise<void>, initial: S) {
  return async (a: Act<S>) => {
    for (;;) {
      await script(a)
      await a.wait(1400)
      await a.set(initial)
      await a.wait(900)
    }
  }
}

type FrameProps = {
  initial: S; poster: S; script?: (a: Act<S>) => Promise<void>; still?: boolean; label: string
  slow?: number // the bars' motion and the pauses play this many times slower; the cursor doesn't
  reduced?: boolean // shows the reduced-motion version
  caption?: string
  cursor?: boolean // false: the camera tells it, nothing is pressed
}
function Frame({ initial, poster, script, still, label, slow = 1, reduced, caption, cursor = true }: FrameProps) {
  const touch = useTouch()
  const [run, setRun] = useState(0)
  // A scene that is shown slowed down lets the reader choose how slow (the user, 2026-11-26): a menu of
  // 1×, 2× and 3× in place of a fixed "Slowed down 3×". It opens on the speed the scene was written
  // for; choosing another plays the scene again at that speed. 1× is the editor's real speed.
  const slowable = slow > 1
  const [speed, setSpeed] = useState(slow)
  // Nothing loops: a scene plays once while the pointer is over it (once when seen, on a phone),
  // and Replay plays it again straight away
  const play = run > 0 ? 'once' : 'hover'
  return (
    <figure className="av-figure" aria-label={label} style={{ '--t': speed } as CSSProperties}>
      <Stage
        key={run}
        width={648}
        height={360}
        compact={{ below: 480, width: 358, height: 260 }}
        initial={initial}
        poster={poster}
        script={script ? humanHand(play === 'hover' && !touch ? whileHovered(script, initial) : script, speed) : undefined}
        play={still ? undefined : play}
        cursor={still || !cursor ? undefined : { at: REST, style: 'arrow' }}
        className={'av-card' + (reduced ? ' av-reduced' : '')}
      >
        {(s, _rect, layout) => (
            <Scene s={s} compact={layout === 'compact'} />
        )}
      </Stage>
      {(caption || !still) && (
        <div className="av-foot">
          {slowable ? (
            <label className="av-speed">
              <span className="av-caption">Slowed down</span>
              <span className="av-speed__pick">
                <select
                  value={speed}
                  aria-label="How much the scene is slowed down"
                  onChange={(e) => { setSpeed(Number(e.target.value)); setRun((n) => n + 1) }}
                >
                  {[1, 2, 3].map((n) => <option key={n} value={n}>{n}×</option>)}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </label>
          ) : (
            caption && <figcaption className="av-caption">{caption}</figcaption>
          )}
          {!still && (
            <button type="button" className="av-replay" onClick={() => setRun((n) => n + 1)}>Replay</button>
          )}
        </div>
      )}
    </figure>
  )
}


/* ---- The whole story, once (about 6s), ending on the payoff ---- */
async function stack(a: Act<S>) {
  await a.wait(700)
  a.mark('open hair')
  await a.enter({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.click({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(800)
  a.mark('pick style')
  await a.click({ at: 'hair-wavy', x: 0.5, y: 0.5 })
  await a.set({ hair: 'wavy' })
  await a.wait(700)
  a.mark('open colour')
  await a.click({ at: 'colour', x: 0.52, y: 0.5 })
  await a.set({ level: 2, enter: 'colour' })
  await a.wait(800)
  a.mark('pick green')
  await a.click({ at: 'green', x: 0.5, y: 0.5 })
  await a.set({ green: true })
  await a.move(REST)
}
export function AvatarsStack() {
  return <Frame label="The stack of bars: Hair rises from the main bar, then Colour rises from Hair" initial={base} poster={{ ...base, level: 2, hair: 'wavy', green: true }} script={stack} />
}

/* ---- Tabs switching in place (about 9s) ---- */
const tabsStart: S = { ...base, level: 1, hair: 'wavy' }
async function tabs(a: Act<S>) {
  await a.wait(400)
  a.mark('wear')
  await a.enter({ at: 'tab-wear', x: 0.55, y: 0.6 })
  await a.click({ at: 'tab-wear', x: 0.55, y: 0.6 })
  await a.set({ tab: 'wear' })
  await a.wait(700)
  a.mark('cap on')
  await a.click({ at: 'hat-hat', x: 0.5, y: 0.5 })
  await a.set({ cap: true })
  await a.wait(1700)
  a.mark('cap off')
  await a.click({ at: 'hat-none', x: 0.5, y: 0.5 })
  await a.set({ cap: false })
  await a.wait(500)
  await a.click({ at: 'tab-style', x: 0.55, y: 0.6 })
  await a.set({ tab: 'style' })
  await a.wait(500)
  await a.move(REST)
  await a.wait(1100)
}
export function AvatarsTabs() {
  return <Frame label="Switching between Style and Headwear inside the Hair bar" initial={tabsStart} poster={{ ...tabsStart, tab: 'wear', cap: true }} script={tabs} />
}

/* ---- A still of the three levels ---- */
const mutedStart: S = { ...base, level: 2, hair: 'wavy', green: true }
export function AvatarsMuted() {
  return <Frame label="The bar in focus, the muted bar under it and the tray" initial={mutedStart} poster={mutedStart} still />
}

/* ---- The bar at rest: tap Hair and it lights and opens; the × cancels it straight away (about 4s) ---- */
async function rest(a: Act<S>) {
  await a.wait(900)
  await a.enter({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.click({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.set({ level: 1, enter: 'hair' })
  // no dwell: the hand heads straight for the bar's × and closes it while the row is still filling in
  await a.wait(80)
  a.mark('cancel')
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0, enter: null })
  await a.wait(300)
  await a.move(REST)
  await a.wait(1200)
}
export function AvatarsRest() {
  return <Frame label="Tapping Hair opens its bar; its × closes it again before it has settled" initial={base} poster={{ ...base, level: 1 }} script={rest} />
}

/* ---- Growing in place: Hair grows over the main bar and sinks back (slowed 3×) ---- */
async function rise(a: Act<S>) {
  await a.wait(300)
  a.mark('rise')
  await a.enter({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.click({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(900)
  a.mark('sink')
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0, enter: null })
  await a.wait(500)
  await a.move(REST)
  await a.wait(900)
}
export function AvatarsRise() {
  return <Frame label="Hair growing in place over the main bar, then sinking back, slowed down" initial={base} poster={{ ...base, level: 1 }} script={rise} slow={3} />
}

/* ---- The stack makes room: Colour rises, Hair slides down and the main bar folds into the tray (slowed 3×) ---- */
const roomStart: S = { ...base, level: 1, hair: 'wavy' }
async function room(a: Act<S>) {
  await a.wait(300)
  a.mark('open colour')
  await a.enter({ at: 'colour', x: 0.52, y: 0.5 })
  await a.click({ at: 'colour', x: 0.52, y: 0.5 })
  await a.set({ level: 2, enter: 'colour' })
  await a.wait(1300)
  a.mark('close')
  await a.click({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.set({ level: 1, enter: null })
  await a.wait(400)
  await a.move(REST)
  await a.wait(800)
}
export function AvatarsRoom() {
  return <Frame label="Colour rises, Hair slides down and the main bar folds into the tray, slowed down" initial={roomStart} poster={{ ...roomStart, level: 2 }} script={room} slow={3} />
}

/* ---- Closing: both bars close, then open again, slowed 2× ---- */
const closeStart: S = { ...base, level: 2, hair: 'wavy', green: true }
async function closing(a: Act<S>) {
  await a.wait(700)
  await a.enter({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.click({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.set({ level: 1, enter: null })
  await a.wait(500)
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0 })
  await a.wait(700)
  // and back, so the loop ends where it began
  await a.click({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(450)
  await a.click({ at: 'colour', x: 0.52, y: 0.5 })
  await a.set({ level: 2, enter: 'colour' })
  await a.move(REST)
  await a.wait(900)
}
export function AvatarsClose() {
  return <Frame label="Each bar sinks back behind the one under it as it closes, slowed down" initial={closeStart} poster={closeStart} script={closing} slow={2} />
}

/* ---- With reduced motion: the same stack, fades only ---- */
async function reducedRun(a: Act<S>) {
  await a.wait(700)
  await a.enter({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.click({ at: 'main-hair', x: 0.55, y: 0.34 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(800)
  await a.click({ at: 'colour', x: 0.52, y: 0.5 })
  await a.set({ level: 2, enter: 'colour' })
  await a.wait(1100)
  await a.click({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.set({ level: 1, enter: null })
  await a.wait(500)
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0 })
  await a.move(REST)
  await a.wait(900)
}
/* ---- Every colour at once: the wheel grows the Colour bar into a panel over both bars; a colour is picked
   there and the panel folds back into the bar, which now wears it ---- */
const panelStart: S = { ...base, level: 2, hair: 'wavy' }
async function panel(a: Act<S>) {
  await a.wait(500)
  a.mark('open the panel')
  await a.enter({ at: 'wheel', x: 0.5, y: 0.5 })
  await a.click({ at: 'wheel', x: 0.5, y: 0.5 })
  await a.set({ panel: true })
  await a.wait(1300)
  a.mark('pick green')
  await a.click({ at: 'cell-green', x: 0.5, y: 0.5 })
  await a.set({ green: true, panel: false })
  await a.wait(500)
  await a.move(REST)
  await a.wait(600)
}
export function AvatarsPanel() {
  return <Frame label="Every colour at once: the Colour bar grows into a panel over both bars, a colour is picked, and it folds back" initial={panelStart} poster={{ ...panelStart, panel: true }} script={panel} />
}
export function AvatarsReduced() {
  return <Frame label="With reduced motion, bars fade in and out without moving" initial={{ ...base, hair: 'wavy' }} poster={{ ...base, hair: 'wavy', level: 2 }} script={reducedRun} reduced caption="With reduced motion on" />
}

export const AVATAR_DEMOS: Record<string, () => ReactNode> = {
  'avatars-rest': AvatarsRest,
  'avatars-rise': AvatarsRise,
  'avatars-room': AvatarsRoom,
  'avatars-close': AvatarsClose,
  'avatars-reduced': AvatarsReduced,
  'avatars-panel': AvatarsPanel,
  'avatars-stack': AvatarsStack,
  'avatars-tabs': AvatarsTabs,
  'avatars-muted': AvatarsMuted,
}
