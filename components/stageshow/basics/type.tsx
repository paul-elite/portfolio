'use client'

import { Bar, Segmented, Stage, Text, Window, type Act } from '../kit'
import { humanHand } from '../hand'
import '../cursor.css'
import './basics.css'

// "Typography, the basics": a type panel beside the text it sets. Beats: the paragraph starts with
// its lines packed solid (line height 1.0); the hand picks 1.5 and the lines get their air, the card
// growing with them; then it tightens the headline's tracking, and the big words pull together.
// The payoff holds, then the same two controls are put back, so the loop's reset has a cause.
//
// Real strings: the headline, the paragraph, the two labels and their values. The paragraph says
// what the first control does, so the frame teaches without the article around it.

type S = { lh: number; tr: number }
const LH = ['1.0', '1.2', '1.5']
const TR = ['0', '−3%']
const initial: S = { lh: 0, tr: 0 }
const poster: S = { lh: 2, tr: 1 }
const REST = { wide: { x: 470, y: 300 }, compact: { x: 300, y: 400 } }

async function script(a: Act<S>) {
  await a.wait(1100)
  a.mark('leading')
  await a.click({ at: 'lh-2', x: 0.5, y: 0.5 })
  await a.set({ lh: 2 })
  await a.wait(1500)
  a.mark('tracking')
  await a.click({ at: 'tr-1', x: 0.5, y: 0.5 })
  await a.set({ tr: 1 })
  await a.move(REST)
  await a.wait(2800)
  a.mark('reset')
  await a.click({ at: 'tr-0', x: 0.5, y: 0.5 })
  await a.set({ tr: 0 })
  await a.wait(300)
  await a.click({ at: 'lh-0', x: 0.5, y: 0.5 })
  await a.set({ lh: 0 })
  await a.move(REST)
  await a.wait(900)
}

const feel = humanHand(script)

export default function BasicsType() {
  return (
    <Stage<S> width={600} height={380} compact={{ below: 520, width: 358, height: 430 }} initial={initial} poster={poster} script={feel} cursor={{ at: REST, style: 'arrow' }} className="bs bs-type">
      {(s) => (
        <Window title="Type" className="bs-win">
          <div className="bs-type__body">
            <div className="bs-type__page">
              <div className="bs-type__card">
                <Text className="bs-type__h" style={{ letterSpacing: s.tr ? '-0.03em' : '0em' }}>Give your text room</Text>
                <Text wrap className="bs-type__p" style={{ lineHeight: [1, 1.2, 1.5][s.lh] }}>
                  Line height is the space between lines. Too little and they blur into one block. Give them air and the eye finds the next line by itself.
                </Text>
              </div>
              <div className="bs-type__next">
                <Bar w={150} h={10} r={5} tone={2} />
                <Bar w="92%" h={7} r={3.5} tone={1} />
                <Bar w="84%" h={7} r={3.5} tone={1} />
                <Bar w="60%" h={7} r={3.5} tone={1} />
              </div>
            </div>
            <div className="bs-type__panel">
              <div className="bs-ctl">
                <Text className="bs-label">Line height</Text>
                <Segmented items={LH} value={s.lh} targets={LH.map((_, i) => `lh-${i}`)} cursor="hand" />
              </div>
              <div className="bs-ctl">
                <Text className="bs-label">Tracking</Text>
                <Segmented items={TR} value={s.tr} targets={TR.map((_, i) => `tr-${i}`)} cursor="hand" />
              </div>
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
