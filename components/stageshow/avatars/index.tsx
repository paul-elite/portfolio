'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Stage, type Act } from '../kit'
import { A } from './assets'
import './avatars.css'

/* The Avatars write-up's scenes: the editor's tab bars on their own (no avatar), built from the
   editor (avatars.paulelite.com) and its Figma (Avatars file, frame 113:9122). The art is the
   editor's own: the hair tiles, tab icons and swatches are generated from its library into assets.ts.

   One stack of bars, three ways to show it:
     AvatarsStack   the whole story: Hair rises from behind the main bar, a style is picked,
                    Colour rises from behind Hair (Hair slides down muted, the main bar folds into
                    the tray), green is picked, both bars close, and undo puts the look back
     AvatarsTabs    switching tabs in place: Style → Wear, a cap goes on (the Colour tile
                    arrives and the bar widens), off again, back to Style
     AvatarsMuted   a still of the three levels: the bar in focus, the muted bar, the tray      */

type Hair = 'boy' | 'spiky'
type S = {
  level: 0 | 1 | 2 // the main bar · Hair over it · Colour over Hair
  enter: 'hair' | 'colour' | null // the bar that just rose, so its options slide in
  hair: Hair
  green: boolean
  tab: 'style' | 'wear'
  cap: boolean
}
const base: S = { level: 0, enter: null, hair: 'boy', green: false, tab: 'style', cap: false }

// ---- Sizes (px), wide and compact. Bars hug their contents; widths are worked out so the
// stage can ease them like the editor does. ----
type Z = ReturnType<typeof sizes>
const sizes = (compact: boolean) => compact
  ? { tab: 40, opt: 48, gap: 6, more: 52, sw: 30, swGap: 2, tool: 36, padL: 4, padR: 10, colPad: 10, close: 24, sep: 2, hairs: ['boy', 'spiky'] as Hair[], hats: ['cap'] as const, swatches: ['#1a1a1a', '#5a3620', '#50c810', '#f70492'], main: 326 }
  : { tab: 54, opt: 48, gap: 10, more: 60, sw: 32, swGap: 4, tool: 40, padL: 4, padR: 16, colPad: 12, close: 28, sep: 2, hairs: ['boy', 'spiky', 'curlytop'] as Hair[], hats: ['cap', 'beanie'] as const, swatches: ['#1a1a1a', '#5a3620', '#a8693f', '#e8b04b', '#50c810', '#f70492'], main: 444 }
// Bars are centred with translateX(-50%): an even width keeps them on whole pixels
const even = (n: number) => Math.ceil(n / 2) * 2
const sum = (n: number, size: number, gap: number) => n * size + Math.max(0, n - 1) * gap
const closeW = (z: Z) => z.gap + z.sep + z.gap + z.close
const tabsW = (z: Z) => 2 * z.tab + 4 + 4
function hairWidth(s: S, z: Z) {
  const opts = s.tab === 'style' ? z.hairs.length : 1 + z.hats.length
  const colour = s.tab === 'style' || s.cap
  return even(z.padL + tabsW(z) + z.gap + sum(opts, z.opt, 9) + (colour ? z.gap + z.more : 0) + closeW(z) + z.padR)
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
const Close = () => <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M18 6 6 18M6 6l12 12" {...LINE} /></svg>
const More = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
    {[6, 12, 18].map((y) => <circle key={y} cx="12" cy={y} r="1.1" fill="currentColor" />)}
  </svg>
)
const None = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
    <circle cx="20" cy="20" r="9" fill="none" stroke="#c9c9c6" strokeWidth="1.5" />
    <path d="M13.6 26.4 26.4 13.6" stroke="#c9c9c6" strokeWidth="1.5" strokeLinecap="round" />
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
const RAINBOW = ['#ff4f4e', '#ffb900', '#00cc1a', '#14c8c8', '#1084fe', '#8b5cf6', '#f70492']

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
  const edits = (s.hair !== 'boy' ? 1 : 0) + (s.green ? 1 : 0) + (s.cap ? 1 : 0)
  const hw = hairWidth(s, z)
  const g = s.green ? 1 : 0
  return (
    <div className="av-scene">
      {/* The tray: the main bar folded under Hair */}
      <div className="av-tray" data-on={s.level === 2 || undefined} style={{ width: hw - 64 }} />

      {/* Colour: rises from behind Hair */}
      <div className="av-bar av-colour" data-pos={colourPos} data-enter={s.enter === 'colour' || undefined} style={{ width: colourWidth(z) }}>
        <div className="av-tools">
          <span className="av-tool">
            <span className="av-layers" aria-hidden>
              <span data-on={!s.green || undefined}><Cluster fills={SHADES_BLACK} /></span>
              <span data-on={s.green || undefined}><Cluster fills={SHADES_GREEN} /></span>
            </span>
          </span>
          <span className="av-tool"><Cluster fills={RAINBOW} /></span>
        </div>
        <span className="av-sep" />
        <div className="av-row av-swatches">
          {z.swatches.map((c) => {
            const on = s.green ? c === '#50c810' : c === '#1a1a1a'
            const d = A.dot[c as keyof typeof A.dot]
            return (
              <span key={c} className="av-swatch" data-target={c === '#50c810' ? 'green' : undefined} data-cursor="pointer">
                <Layers show={on ? 1 : 0} items={[d.off, d.on]} />
              </span>
            )
          })}
        </div>
        <span className="av-sep" />
        <span className="av-close" data-target="close-colour" data-cursor="pointer"><Close /></span>
      </div>

      {/* Hair: rises from behind the main bar; slides down muted under Colour */}
      <div className="av-bar av-hair" data-pos={hairPos} data-muted={s.level === 2 || undefined} data-enter={s.enter === 'hair' || undefined} style={{ width: hw }}>
        <div className="av-tabs">
          <span className="av-tab" data-on={s.tab === 'style' || undefined} data-target="tab-style" data-cursor="pointer">
            <Layers className="av-tab__art" show={s.tab !== 'style' ? 0 : 1 + g} items={[A.tab.styleOff, A.tab.styleBlack, A.tab.styleGreen]} />
            <span className="av-label">Style</span>
          </span>
          <span className="av-tab" data-on={s.tab === 'wear' || undefined} data-target="tab-wear" data-cursor="pointer">
            <Layers className="av-tab__art" show={s.tab === 'wear' && s.cap ? 1 : 0} items={[A.tab.wear, A.tab.wearOn]} />
            <span className="av-label">Wear</span>
          </span>
        </div>
        {/* Both tabs' rows share one cell (they're the same width); the chosen one crosses in */}
        <div className="av-rows">
          <div className="av-row" data-on={s.tab === 'style' || undefined}>
            {z.hairs.map((h) => (
              <span key={h} className="av-opt" data-on={s.hair === h || undefined} data-target={s.tab === 'style' ? 'hair-' + h : undefined} data-cursor="pointer">
                <Layers show={g} items={[A.hairTiles.black[h], A.hairTiles.green[h]]} />
              </span>
            ))}
          </div>
          <div className="av-row" data-on={s.tab === 'wear' || undefined}>
            <span className="av-opt" data-on={!s.cap || undefined} data-target={s.tab === 'wear' ? 'hat-none' : undefined} data-cursor="pointer"><None /></span>
            {z.hats.map((h) => (
              <span key={h} className="av-opt" data-on={(s.cap && h === 'cap') || undefined} data-target={s.tab === 'wear' ? 'hat-' + h : undefined} data-cursor="pointer"><Svg src={A.hatTiles[h]} /></span>
            ))}
          </div>
        </div>
        <span className="av-more" data-show={s.tab === 'style' || s.cap || undefined} data-on={s.level === 2 || undefined} data-target="colour" data-cursor="pointer">
          <Layers className="av-more__art" show={s.tab === 'wear' ? 2 : g} items={[A.wheel.black, A.wheel.green, A.wheel.pink]} />
          <span className="av-label">Colour</span>
        </span>
        <span className="av-sep" />
        <span className="av-close" data-target="close-hair" data-cursor="pointer"><Close /></span>
      </div>

      {/* The main bar: the floor */}
      <div className="av-bar av-main" data-pos={mainPos} style={{ width: z.main }}>
        <div className="av-history">
          <span className="av-hist" data-off={!edits || undefined} data-target="undo" data-cursor="pointer"><Undo /></span>
          <span className="av-hist" data-off><Undo redo /></span>
        </div>
        <span className="av-groove" />
        <div className="av-cats">
          <span className="av-ind" data-on={s.level > 0 || undefined} />
          {(['face', 'hair', 'outfit', 'color'] as const).map((k) => (
            <span key={k} className="av-cat" data-k={k} data-on={(s.level > 0 && k === 'hair') || undefined} data-target={k === 'hair' ? 'main-hair' : undefined} data-cursor="pointer">
              {k === 'hair'
                ? <Layers className="av-cat__art" show={s.level > 0 ? 1 : 0} items={[A.bar.hair, A.bar.hairOn]} />
                : <Svg src={A.bar[k]} className="av-cat__art" />}
              <span className="av-label">{k === 'color' ? 'Color' : k[0].toUpperCase() + k.slice(1)}</span>
            </span>
          ))}
        </div>
        <span className="av-groove" />
        <span className="av-hist av-more-btn"><More /></span>
      </div>
    </div>
  )
}

// Rest in the top-right gutter, clear of every target
const REST = { wide: { x: 520, y: 30 }, compact: { x: 334, y: 18 } }

// A phone gets a finger (a dot where it taps), never the macOS arrow
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

const ReplayIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M4 12a8 8 0 1 0 2.35-5.65M4 4v4.5h4.5" {...LINE} /></svg>

type FrameProps = {
  initial: S; poster: S; script?: (a: Act<S>) => Promise<void>; still?: boolean; play?: 'loop' | 'once'; label: string
  slow?: number // plays this many times slower (script and CSS alike), to show the motion
  reduced?: boolean // shows the reduced-motion version
  caption?: string
}
function Frame({ initial, poster, script, still, play = 'loop', label, slow = 1, reduced, caption }: FrameProps) {
  const touch = useTouch()
  const [run, setRun] = useState(0)
  return (
    <figure className="av-figure" aria-label={label} style={{ '--t': slow } as CSSProperties}>
      <Stage
        key={run}
        width={560}
        height={248}
        compact={{ below: 560, width: 358, height: 208 }}
        initial={initial}
        poster={poster}
        script={script}
        play={still ? undefined : play}
        speed={1 / slow}
        cursor={still ? undefined : { at: REST, style: touch ? 'touch' : 'real', ripple: touch }}
        className={'av-card' + (reduced ? ' av-reduced' : '')}
      >
        {(s, _rect, layout) => <Scene s={s} compact={layout === 'compact'} />}
      </Stage>
      {(caption || (play === 'once' && !still)) && (
        <div className="av-foot">
          {caption && <figcaption className="av-caption">{caption}</figcaption>}
          {play === 'once' && !still && (
            // Plays once as it comes into view and holds on the result; this plays it again
            <button type="button" className="av-replay" onClick={() => setRun((n) => n + 1)}><ReplayIcon />Replay</button>
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
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(800)
  a.mark('pick style')
  await a.click({ at: 'hair-spiky', x: 0.5, y: 0.5 })
  await a.set({ hair: 'spiky' })
  await a.wait(700)
  a.mark('open colour')
  await a.click({ at: 'colour', x: 0.5, y: 0.3 })
  await a.set({ level: 2, enter: 'colour' })
  await a.wait(800)
  a.mark('pick green')
  await a.click({ at: 'green', x: 0.5, y: 0.5 })
  await a.set({ green: true })
  await a.move(REST)
}
export function AvatarsStack() {
  return <Frame label="The stack of bars: Hair rises from the main bar, then Colour rises from Hair" initial={base} poster={{ ...base, level: 2, hair: 'spiky', green: true }} script={stack} play="once" />
}

/* ---- Tabs switching in place (about 9s) ---- */
const tabsStart: S = { ...base, level: 1, hair: 'spiky' }
async function tabs(a: Act<S>) {
  await a.wait(900)
  a.mark('wear')
  await a.click({ at: 'tab-wear', x: 0.5, y: 0.3 })
  await a.set({ tab: 'wear' })
  await a.wait(700)
  a.mark('cap on')
  await a.click({ at: 'hat-cap', x: 0.5, y: 0.5 })
  await a.set({ cap: true })
  await a.wait(1700)
  a.mark('cap off')
  await a.click({ at: 'hat-none', x: 0.5, y: 0.5 })
  await a.set({ cap: false })
  await a.wait(500)
  await a.click({ at: 'tab-style', x: 0.5, y: 0.3 })
  await a.set({ tab: 'style' })
  await a.move(REST)
  await a.wait(1100)
}
export function AvatarsTabs() {
  return <Frame label="Switching between Style and Wear inside the Hair bar" initial={tabsStart} poster={{ ...tabsStart, tab: 'wear', cap: true }} script={tabs} />
}

/* ---- A still of the three levels ---- */
export function AvatarsMuted() {
  const s: S = { ...base, level: 2, hair: 'spiky', green: true }
  return <Frame label="Three levels: the bar in focus, the muted bar under it, the tray" initial={s} poster={s} still />
}

/* ---- The bar at rest: tap Hair and it lights and opens; tap it again and both go (about 5s) ---- */
async function rest(a: Act<S>) {
  await a.wait(900)
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(1500)
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 0, enter: null })
  await a.move(REST)
  await a.wait(1200)
}
export function AvatarsRest() {
  return <Frame label="Tapping Hair opens its bar; tapping it again closes it" initial={base} poster={{ ...base, level: 1 }} script={rest} />
}

/* ---- Rising from behind, and sinking back, slowed 3× ---- */
async function rise(a: Act<S>) {
  await a.wait(500)
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(900)
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0, enter: null })
  await a.move(REST)
  await a.wait(700)
}
export function AvatarsRise() {
  return <Frame label="Hair rises from behind the main bar and sinks back, slowed down" initial={base} poster={{ ...base, level: 1 }} script={rise} slow={3} caption="Slowed down 3×" />
}

/* ---- The stack makes room: Colour rises from Hair while Hair slides down and the main bar folds, slowed 3× ---- */
const roomStart: S = { ...base, level: 1, hair: 'spiky' }
async function room(a: Act<S>) {
  await a.wait(500)
  await a.click({ at: 'colour', x: 0.5, y: 0.3 })
  await a.set({ level: 2, enter: 'colour' })
  await a.wait(1000)
  await a.click({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.set({ level: 1, enter: null })
  await a.move(REST)
  await a.wait(700)
}
export function AvatarsRoom() {
  return <Frame label="Colour rises from Hair while Hair slides down and the main bar folds into the tray, slowed down" initial={roomStart} poster={{ ...roomStart, level: 2 }} script={room} slow={3} caption="Slowed down 3×" />
}

/* ---- Closing: both bars close, then open again, slowed 2× ---- */
const closeStart: S = { ...base, level: 2, hair: 'spiky', green: true }
async function closing(a: Act<S>) {
  await a.wait(700)
  await a.click({ at: 'close-colour', x: 0.5, y: 0.5 })
  await a.set({ level: 1, enter: null })
  await a.wait(500)
  await a.click({ at: 'close-hair', x: 0.5, y: 0.5 })
  await a.set({ level: 0 })
  await a.wait(700)
  // and back, so the loop ends where it began
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(450)
  await a.click({ at: 'colour', x: 0.5, y: 0.3 })
  await a.set({ level: 2, enter: 'colour' })
  await a.move(REST)
  await a.wait(900)
}
export function AvatarsClose() {
  return <Frame label="Each bar sinks back behind the one under it as it closes, slowed down" initial={closeStart} poster={closeStart} script={closing} slow={2} caption="Slowed down 2×" />
}

/* ---- With reduced motion: the same stack, fades only ---- */
async function reducedRun(a: Act<S>) {
  await a.wait(700)
  await a.click({ at: 'main-hair', x: 0.5, y: 0.3 })
  await a.set({ level: 1, enter: 'hair' })
  await a.wait(800)
  await a.click({ at: 'colour', x: 0.5, y: 0.3 })
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
export function AvatarsReduced() {
  return <Frame label="With reduced motion, bars fade in and out without moving" initial={{ ...base, hair: 'spiky' }} poster={{ ...base, hair: 'spiky', level: 2 }} script={reducedRun} reduced caption="With reduced motion on" />
}

export const AVATAR_DEMOS: Record<string, () => ReactNode> = {
  'avatars-rest': AvatarsRest,
  'avatars-rise': AvatarsRise,
  'avatars-room': AvatarsRoom,
  'avatars-close': AvatarsClose,
  'avatars-reduced': AvatarsReduced,
  'avatars-stack': AvatarsStack,
  'avatars-tabs': AvatarsTabs,
  'avatars-muted': AvatarsMuted,
}
