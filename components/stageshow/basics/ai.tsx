'use client'

import { Collapse, Field, Stage, Stream, Text, Window, type Act } from '../kit'
import './basics.css'

// "AI, the basics": the same assistant asked twice. The first exchange is already in the thread: a
// loose ask, and the all-purpose answer it earns. Beats: a second ask is typed, this time saying
// what the work is, who it is for and how long; it is sent, a short Thinking, and the answer streams
// in, specific because the ask was. Plays once; the still is the payoff, both answers in view.
// (After the kit's ai-chat example: every word is laid out from the start, so nothing reflows.)
//
// Real strings: both asks and both answers. They are the lesson, so none of it is filler.

const Q1 = 'Write a caption for my design post'
const A1 = 'Excited to share my latest design. Let me know what you think!'
const Q2 = 'Caption for a checkout redesign, for junior designers, one lesson'
const A2 = 'I moved the price above the Pay button, and fewer people left at the last step. The lesson: show the cost before you ask for the click.'
const WORDS = A2.split(' ').length

type S = { draft: string; sent: boolean; phase: 'idle' | 'thinking' | 'answer'; words: number }
const initial: S = { draft: '', sent: false, phase: 'idle', words: 0 }
const poster: S = { draft: '', sent: true, phase: 'answer', words: WORDS }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('type')
  await a.type('draft', Q2, { interval: 34 })
  await a.wait(450)
  a.mark('send')
  a.put({ sent: true, draft: '' })
  await a.wait(450)
  a.put({ phase: 'thinking' })
  await a.wait(1100)
  a.mark('stream')
  a.put({ phase: 'answer' })
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i })
    await a.wait(45)
  }
  await a.wait(2600)
}

export default function BasicsAi() {
  return (
    <Stage<S> width={600} height={400} compact={{ below: 520, width: 358, height: 500 }} initial={initial} poster={poster} script={script} play="once" className="bs bs-ai">
      {(s) => (
        <Window title="Assistant" className="bs-win">
          <div className="bs-ai__body">
            <div className="bs-ai__thread">
              <div className="bs-ai__q"><Text>{Q1}</Text></div>
              <Text wrap className="bs-ai__a bs-ai__a--past">{A1}</Text>
              <Collapse open={s.sent} reveal="drop" from="below">
                <div className="bs-ai__q"><Text>{Q2}</Text></div>
              </Collapse>
              <Collapse open={s.phase === 'thinking'}>
                <Text className="bs-ai__thinking">Thinking</Text>
              </Collapse>
              <Collapse open={s.phase === 'answer'}>
                <Stream className="bs-ai__a" text={A2} count={s.words} />
              </Collapse>
            </div>
            <Field className="bs-ai__composer" value={s.draft} placeholder="Ask anything" focused={!s.sent} />
          </div>
        </Window>
      )}
    </Stage>
  )
}
