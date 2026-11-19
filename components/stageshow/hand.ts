import type { Act } from './kit'

// How a stage's hand moves. Each trip dips deeper than the kit's shallow arc, and the dip comes early
// and sharp, as a wrist flicks toward a target; the last stretch straightens out onto it. A slowed
// scene (slow > 1) stretches the beats between actions but never the hand, which keeps real trip
// times and presses.
type Pt = { x: number; y: number }
export const dip = (e: number, from: Pt, end: Pt): Pt => {
  const dx = end.x - from.x, dy = end.y - from.y
  const dist = Math.hypot(dx, dy) || 1
  const bow = Math.min(dist * 0.17, 46)
  const lift = Math.sin(Math.PI * Math.pow(e, 0.6)) * bow
  return { x: from.x + dx * e - (dy / dist) * lift, y: from.y + dy * e + (dx / dist) * lift }
}

export function humanHand<T>(script: (a: Act<T>) => Promise<void>, slow = 1) {
  return (a: Act<T>) => {
    type Move = Act<T>['move']
    const move = ((to, opts) => a.move(to, { ...opts, path: opts?.path ?? dip })) as Move
    const proxy: Act<T> = new Proxy(a, {
      get(t, k) {
        if (k === 'wait') return (ms: number) => t.wait(ms * slow)
        if (k === 'move') return move
        // click travels with the same dip, then presses where it landed
        if (k === 'click') return async (to?: Parameters<Act<T>['click']>[0], opts?: Parameters<Act<T>['click']>[1]) => { if (to !== undefined) await move(to); return t.click(to, opts) }
        const v = (t as unknown as Record<string | symbol, unknown>)[k]
        return typeof v === 'function' ? (v as (...x: unknown[]) => unknown).bind(t) : v
      },
    })
    return script(proxy)
  }
}
