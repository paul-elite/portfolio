import { Stage, Swap, type Act } from '../../kit'
import * as svg from './assets'
import './mytasks.css'

// The Designing Search card, built from Paul's Figma (portfolio file, page
// "Feature cards": Frame 22 is the opening, Frame 26 the payoff). A quiet
// task app in a browser window on a grey plate. Story: the page is starred,
// the star fills and the view becomes "Tasks"; the first task's status is
// clicked from Done to Paid. The payoff holds, then the same two clicks put
// it back, so the loop's reset has a visible cause.

type S = { starred: boolean; status: 'Done' | 'Paid' }
const initial: S = { starred: false, status: 'Done' }
const REST = { x: 470, y: 268 }

async function script(a: Act<S>) {
  await a.wait(1000)

  // 1. Star the page: the star fills and the view is "Tasks"
  a.mark('star')
  await a.click({ at: 'star', x: 0.5, y: 0.5 })
  await a.set({ starred: true })
  await a.wait(900)

  // 2. The first task goes from Done to Paid
  a.mark('status')
  await a.click({ at: 'status', x: 0.5, y: 0.5 })
  await a.set({ status: 'Paid' })
  await a.move(REST)
  await a.wait(2400)

  // 3. Put it back the same way
  a.mark('reset')
  await a.click({ at: 'status', x: 0.5, y: 0.5 })
  await a.set({ status: 'Done' })
  await a.wait(350)
  await a.click({ at: 'star', x: 0.5, y: 0.5 })
  await a.set({ starred: false })
  await a.move(REST)
  await a.wait(900)
}

const Svg = ({ src, className }: { src: string; className?: string }) => (
  <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: src }} />
)

export default function MyTasks() {
  return (
    <Stage width={552} height={305} initial={initial} poster={{ starred: true, status: 'Paid' }} script={script} cursor={{ at: REST }} className="mt-card">
      {(s) => <Scene s={s} />}
    </Stage>
  )
}

function Scene({ s }: { s: S }) {
  return (
    <div className="mt-plate">
      <div className="mt-window">
        <aside className="mt-sidebar">
          <div className="mt-lights">
            <span data-c="r" />
            <span data-c="y" />
            <span data-c="g" />
          </div>
          <div className="mt-nav">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mt-nav__item" data-on={i === 0 || undefined}>
                <span className="mt-nav__icon" />
                <span className="mt-nav__bar" />
              </div>
            ))}
          </div>
        </aside>

        <div className="mt-main">
          <div className="mt-toolbar">
            <div className="mt-url">
              <span className="mt-url__text">mytasks.com</span>
              <span className="mt-star" data-target="star" data-cursor="hand" data-on={s.starred || undefined}>
                <Svg src={svg.star} className="mt-star__off" />
                <Svg src={svg.starFilled} className="mt-star__on" />
              </span>
            </div>
          </div>

          <div className="mt-content">
            <div className="mt-head">
              <div className="mt-title">
                <Swap id={s.starred ? 'tasks' : 'today'} duration={320}>
                  {s.starred ? 'Tasks' : 'Today’s tasks'}
                </Swap>
              </div>
              <div className="mt-add">Add Task</div>
            </div>

            <div className="mt-list">
              <div className="mt-row">
                <div className="mt-row__lead">
                  <Svg src={svg.avatar} className="mt-avatar" />
                  <span className="mt-row__name">website</span>
                </div>
                <div className="mt-row__col">
                  <span className="mt-row__muted">website</span>
                </div>
                <div className="mt-row__col mt-row__col--status">
                  <span className="mt-pill" data-target="status" data-cursor="hand">
                    <Svg src={svg.dot} className="mt-pill__dot" />
                    <span className="mt-pill__label">
                      <Swap id={s.status} duration={300}>
                        {s.status}
                      </Swap>
                    </span>
                  </span>
                </div>
                <div className="mt-row__end">
                  <span className="mt-delete">
                    <Svg src={svg.trash} className="mt-delete__icon" />
                  </span>
                </div>
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="mt-row">
                  <Svg src={svg.skeletonLead} className="mt-skel-lead" />
                  <div className="mt-row__col">
                    <span className="mt-skel-bar" />
                  </div>
                  <div className="mt-row__col mt-row__col--status">
                    <span className="mt-skel-pill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
