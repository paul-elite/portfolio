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
    // Cropped to the screen itself: the export's 1px border and the strips beside the nav bar removed
    width: 683,
    height: 1493,
    base: rigintel('base-v3'),
    // Listed in Figma's stacking order, bottom to top
    layers: [
      // Stations and depots, roughly top to bottom
      { src: rigintel('m8'), x: 123.6, y: -1, w: 47.8, h: 23, motion: 'pop', delay: 0.3 },
      { src: rigintel('s3'), x: 29, y: 60.9, w: 57.5, h: 57.6, motion: 'pop', delay: 0.34 },
      { src: rigintel('m7'), x: 526, y: 200.6, w: 47.8, h: 47.8, motion: 'pop', delay: 0.38 },
      { src: rigintel('m3'), x: 250.1, y: 218.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.42 },
      { src: rigintel('s1'), x: 108.6, y: 244.9, w: 57.5, h: 57.6, motion: 'pop', delay: 0.46 },
      { src: rigintel('s2'), x: 603.8, y: 312.1, w: 57.5, h: 57.6, motion: 'pop', delay: 0.5 },
      { src: rigintel('p2'), x: 520.8, y: 378.1, w: 63.3, h: 63.3, motion: 'pop', delay: 0.54 },
      { src: rigintel('p1'), x: 121.7, y: 386.6, w: 63.3, h: 63.3, motion: 'pop', delay: 0.58 },
      { src: rigintel('m5'), x: 27.2, y: 448.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.62 },
      { src: rigintel('m1'), x: 223.6, y: 457.1, w: 47.8, h: 47.8, motion: 'pop', delay: 0.66 },
      { src: rigintel('p3'), x: 592.4, y: 612.5, w: 63.3, h: 63.3, motion: 'pop', delay: 0.7 },
      { src: rigintel('m4'), x: 356.2, y: 685.3, w: 47.8, h: 47.8, motion: 'pop', delay: 0.74 },
      { src: rigintel('m6'), x: 584.4, y: 687, w: 47.8, h: 47.8, motion: 'pop', delay: 0.78 },
      { src: rigintel('m2'), x: 233.3, y: 773.7, w: 47.8, h: 47.8, motion: 'pop', delay: 0.82 },
      // The trip, stacked as in Figma: route, truck, then the depot pin
      { src: rigintel('route'), x: 220, y: 437.6, w: 173.8, h: 263.7, motion: 'draw', delay: 1.1 },
      { src: rigintel('truck'), x: 180.9, y: 641.5, w: 80.7, h: 75.2, motion: 'pulse', delay: 0.9 },
      { src: rigintel('dest'), x: 270.2, y: 360.3, w: 113.2, h: 116.7, motion: 'drop', delay: 1.75 },
      // The order card, then the distance pill on top
      { src: rigintel('card'), x: 18.9, y: 877.6, w: 645.6, h: 410.8, motion: 'rise', delay: 0.45 },
      { src: rigintel('pill'), x: 122.7, y: 28.2, w: 439.3, h: 66.9, motion: 'lower', delay: 0.15 },
    ],
  },
};
