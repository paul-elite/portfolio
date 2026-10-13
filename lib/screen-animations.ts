// Animated home screens: a project's base screen rebuilt from its Figma layers, so the interface
// itself moves (markers pop in, the route draws, panels slide into place) instead of a still image.
// Positions are in the Figma frame's pixels; images live in the Supabase `uploads` bucket.

const STORAGE = 'https://xvemgsowtgjnnwpgzjve.supabase.co/storage/v1/object/public/uploads';

export type LayerMotion =
  | 'pop'    // scales up from small, with a little overshoot
  | 'drop'   // falls into place from above
  | 'draw'   // revealed from its start point, like a line being drawn
  | 'rise'   // slides up into place
  | 'lower'  // slides down into place
  | 'pulse'; // appears, then keeps a soft pulse ring around it

export interface ScreenLayer { src: string; x: number; y: number; w: number; h: number; motion: LayerMotion; delay: number }
export interface AnimatedScreen { width: number; height: number; base: string; layers: ScreenLayer[] }

const rigintel = (name: string) => `${STORAGE}/projects/rigintel/map/${name}.png`;

export const ANIMATED_SCREENS: Record<string, AnimatedScreen> = {
  // Rigintel's map ("iPhone 16 Pro - 8" on the Figma "process" page)
  rigintel: {
    width: 688,
    height: 1496,
    base: rigintel('base'),
    // Listed in Figma's stacking order, bottom to top
    layers: [
      // Stations and depots, roughly top to bottom
      { src: rigintel('m8'), x: 125.6, y: 0, w: 47.8, h: 23, motion: 'pop', delay: 0.3 },
      { src: rigintel('s3'), x: 31, y: 61.9, w: 57.5, h: 57.6, motion: 'pop', delay: 0.34 },
      { src: rigintel('m7'), x: 528, y: 201.6, w: 47.8, h: 47.8, motion: 'pop', delay: 0.38 },
      { src: rigintel('m3'), x: 252.1, y: 219.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.42 },
      { src: rigintel('s1'), x: 110.6, y: 245.9, w: 57.5, h: 57.6, motion: 'pop', delay: 0.46 },
      { src: rigintel('s2'), x: 605.8, y: 313.1, w: 57.5, h: 57.6, motion: 'pop', delay: 0.5 },
      { src: rigintel('p2'), x: 522.8, y: 379.1, w: 63.3, h: 63.3, motion: 'pop', delay: 0.54 },
      { src: rigintel('p1'), x: 123.7, y: 387.6, w: 63.3, h: 63.3, motion: 'pop', delay: 0.58 },
      { src: rigintel('m5'), x: 29.2, y: 449.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.62 },
      { src: rigintel('m1'), x: 225.6, y: 458.1, w: 47.8, h: 47.8, motion: 'pop', delay: 0.66 },
      { src: rigintel('p3'), x: 594.4, y: 613.5, w: 63.3, h: 63.3, motion: 'pop', delay: 0.7 },
      { src: rigintel('m4'), x: 358.2, y: 686.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.74 },
      { src: rigintel('m6'), x: 586.4, y: 688, w: 47.8, h: 47.8, motion: 'pop', delay: 0.78 },
      { src: rigintel('m2'), x: 235.3, y: 774.7, w: 47.8, h: 47.8, motion: 'pop', delay: 0.82 },
      // The trip, stacked as in Figma: route, truck, then the depot pin
      { src: rigintel('route'), x: 222, y: 438.6, w: 173.8, h: 263.7, motion: 'draw', delay: 1.1 },
      { src: rigintel('truck'), x: 182.9, y: 642.5, w: 80.7, h: 75.2, motion: 'pulse', delay: 0.9 },
      { src: rigintel('dest'), x: 272.2, y: 361.3, w: 113.2, h: 116.7, motion: 'drop', delay: 1.75 },
      // The order card, then the distance pill on top
      { src: rigintel('card'), x: 20.9, y: 878.6, w: 645.6, h: 410.8, motion: 'rise', delay: 0.45 },
      { src: rigintel('pill'), x: 124.7, y: 29.2, w: 439.3, h: 66.9, motion: 'lower', delay: 0.15 },
    ],
  },
};
