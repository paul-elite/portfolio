'use client'

import { Badge, Roll, Stage, Text, Window, type Act } from '../kit'
import { humanHand } from '../hand'
import '../cursor.css'
import './basics.css'

// "Colour, the basics": a contrast checker. White words sit on a blue; under them, four steps of
// that blue and the contrast ratio between the words and the step chosen. Beats: on the palest step
// the words barely show and the ratio fails; the hand picks a deeper step and the ratio rolls past
// 4.5, the pass mark for text; one step deeper passes the stricter 7. Then back to the pale step,
// which is the reset.
//
// The ratios are worked out here from the colours (the WCAG formula), never typed in, so the
// numbers on screen are the real ones for these four blues.

const STEPS = ['#9db8ff', '#5f88fb', '#255af6', '#17359a']
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const RATIO = STEPS.map((c) => 1.05 / (lum(c) + 0.05))
const grade = (r: number) => (r >= 7 ? { label: 'Passes AAA', tone: 'success' as const } : r >= 4.5 ? { label: 'Passes AA', tone: 'success' as const } : { label: 'Fails', tone: 'danger' as const })

type S = { step: number }
const initial: S = { step: 0 }
const poster: S = { step: 2 }
const REST = { wide: { x: 330, y: 348 }, compact: { x: 300, y: 300 } }

async function script(a: Act<S>) {
  const rest = () => a.move(REST)
  await a.wait(1200)
  a.mark('pass')
  await a.click({ at: 'step-2', x: 0.5, y: 0.5 })
  await a.set({ step: 2 })
  await a.wait(1900)
  a.mark('deeper')
  await a.click({ at: 'step-3', x: 0.5, y: 0.5 })
  await a.set({ step: 3 })
  await rest()
  await a.wait(2600)
  a.mark('reset')
  await a.click({ at: 'step-0', x: 0.5, y: 0.5 })
  await a.set({ step: 0 })
  await rest()
  await a.wait(900)
}

const feel = humanHand(script)

export default function BasicsColour() {
  return (
    <Stage<S> width={600} height={380} compact={{ below: 520, width: 358, height: 430 }} initial={initial} poster={poster} script={feel} cursor={{ at: REST, style: 'arrow' }} className="bs bs-colour">
      {(s) => {
        const g = grade(RATIO[s.step])
        return (
          <Window title="Contrast" className="bs-win">
            <div className="bs-colour__body">
              <div className="bs-colour__sample" style={{ background: STEPS[s.step] }}>
                <Text className="bs-colour__big">Join the cohort</Text>
                <Text className="bs-colour__small">White text on this blue</Text>
              </div>
              <div className="bs-colour__foot">
                <div className="bs-ctl">
                  <Text className="bs-label">Background</Text>
                  <div className="bs-colour__steps">
                    {STEPS.map((c, i) => (
                      <span key={c} className="bs-colour__step" data-target={`step-${i}`} data-cursor="hand" data-on={i === s.step || undefined}>
                        <span style={{ background: c }} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bs-ctl bs-colour__read">
                  <Text className="bs-label">Contrast</Text>
                  <div className="bs-colour__ratio">
                    <span className="bs-colour__num"><Roll>{`${RATIO[s.step].toFixed(1)} : 1`}</Roll></span>
                    <Badge tone={g.tone}><Roll variant="fade">{g.label}</Roll></Badge>
                  </div>
                </div>
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
