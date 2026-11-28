'use client'

import { Bar, Count, Row, Stage, Text, Toggle, Window, type Act } from '../kit'
import { humanHand } from '../hand'
import '../cursor.css'
import './basics.css'

// "Building a product, the basics": the scope of a first version. Six features, each with the weeks
// it costs and a switch; the total is in the window's bar. Beats: everything is on and the total is
// 18 weeks; the hand switches off the three a first version can live without, one at a time, and the
// total rolls down after each, to 8. The payoff holds, then the three go back on, last one first.
//
// Real strings: the six features with their weeks, and the total. The total is added up from the
// rows that are on, never typed in.

const ROWS = [
  { name: 'Sign in', weeks: 2 },
  { name: 'Book a session', weeks: 3 },
  { name: 'Payments', weeks: 3 },
  { name: 'Team chat', weeks: 4 },
  { name: 'Dark mode', weeks: 2 },
  { name: 'AI assistant', weeks: 4 },
]
const CUT = [3, 4, 5]

type S = { on: boolean[] }
const initial: S = { on: ROWS.map(() => true) }
const poster: S = { on: ROWS.map((_, i) => !CUT.includes(i)) }
const REST = { wide: { x: 300, y: 340 }, compact: { x: 180, y: 400 } }

async function script(a: Act<S>) {
  const flip = async (i: number, on: boolean, hold: number) => {
    await a.click({ at: `sw-${i}`, x: 0.5, y: 0.5 })
    await a.set((s) => ({ on: s.on.map((v, k) => (k === i ? on : v)) }))
    await a.wait(hold)
  }
  const rest = () => a.move(REST)
  await a.wait(1100)
  a.mark('cut')
  for (const i of CUT) await flip(i, false, 650)
  await rest()
  await a.wait(2800)
  a.mark('reset')
  for (const i of [...CUT].reverse()) await flip(i, true, 220)
  await rest()
  await a.wait(900)
}

const feel = humanHand(script)

export default function BasicsProduct() {
  return (
    <Stage<S> width={600} height={380} compact={{ below: 520, width: 358, height: 430 }} initial={initial} poster={poster} script={feel} cursor={{ at: REST, style: 'arrow' }} className="bs bs-product">
      {(s) => {
        const total = ROWS.reduce((n, r, i) => n + (s.on[i] ? r.weeks : 0), 0)
        return (
          <Window title="Version 1" className="bs-win">
            <div className="bs-product__body">
              <div className="bs-product__head">
                <Text className="bs-label">Ships in</Text>
                <span className="bs-product__total"><Count value={total} /><span className="bs-product__unit">weeks</span></span>
              </div>
              <div className="bs-product__list">
                {ROWS.map((r, i) => (
                  <Row key={r.name} pad={0} className="bs-product__row" data-off={!s.on[i] || undefined} title={<Text className="bs-product__name">{r.name}</Text>}>
                    <Text className="bs-product__weeks">{`${r.weeks} wk`}</Text>
                    <Toggle on={s.on[i]} data-target={`sw-${i}`} data-cursor="hand" />
                  </Row>
                ))}
                <Row pad={0} className="bs-product__row" title={<Bar w={110} h={8} r={4} tone={2} />}>
                  <Bar w={28} h={7} r={3.5} tone={2} />
                  <Toggle on={false} />
                </Row>
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
