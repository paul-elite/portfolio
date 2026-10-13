// Animated screens: a project's screens rebuilt from their Figma layers so the interface itself
// moves, in the order a person would experience it, once, as the screen comes into view.
// Positions are in the screen's own pixels; images live in the Supabase `uploads` bucket.

const STORAGE = 'https://xvemgsowtgjnnwpgzjve.supabase.co/storage/v1/object/public/uploads';

/** Where a layer starts before easing into place. x/y in screen pixels; `reveal: 'up'` wipes it in from the bottom. */
export interface LayerFrom { x?: number; y?: number; scale?: number; opacity?: number; reveal?: 'up' }

export interface ScreenLayer {
  src: string;
  x: number; y: number; w: number; h: number;
  from: LayerFrom;
  /** Seconds after the screen comes into view */
  delay: number;
  /** Seconds; defaults to a soft spring */
  duration?: number;
  /** Keep a gentle pulse ring around it once it has arrived */
  pulse?: boolean;
}

export interface AnimatedScreen { width: number; height: number; base: string; layers: ScreenLayer[] }

const map = (name: string) => `${STORAGE}/projects/rigintel/map/${name}.png`;
const anim = (name: string) => `${STORAGE}/projects/rigintel/anim/${name}.png`;

// Map markers settle in together, a beat apart, barely moving
const marker = (name: string, x: number, y: number, w: number, h: number, i: number): ScreenLayer =>
  ({ src: map(name), x, y, w, h, from: { opacity: 0, scale: 0.85 }, delay: 0.2 + i * 0.025 });

// Keyed by reel item slug: a project's main screen, then its other screens as `<slug>~2`, `~3`…
export const ANIMATED_SCREENS: Record<string, AnimatedScreen> = {
  // Map: the depots appear, the route draws up from the truck, the depot pin settles, the order card rises
  rigintel: {
    width: 683,
    height: 1493,
    base: map('base-v3'),
    // Listed in Figma's stacking order, bottom to top
    layers: [
      marker('m8', 123.6, -1, 47.8, 23, 0),
      marker('s3', 29, 60.9, 57.5, 57.6, 1),
      marker('m7', 526, 200.6, 47.8, 47.8, 2),
      marker('m3', 250.1, 218.3, 47.8, 47.8, 3),
      marker('s1', 108.6, 244.9, 57.5, 57.6, 4),
      marker('s2', 603.8, 312.1, 57.5, 57.6, 5),
      marker('p2', 520.8, 378.1, 63.3, 63.3, 6),
      marker('p1', 121.7, 386.6, 63.3, 63.3, 7),
      marker('m5', 27.2, 448.3, 47.8, 47.8, 8),
      marker('m1', 223.6, 457.1, 47.8, 47.8, 9),
      marker('p3', 592.4, 612.5, 63.3, 63.3, 10),
      marker('m4', 356.2, 685.3, 47.8, 47.8, 11),
      marker('m6', 584.4, 687, 47.8, 47.8, 12),
      marker('m2', 233.3, 773.7, 47.8, 47.8, 13),
      { src: map('route'), x: 220, y: 437.6, w: 173.8, h: 263.7, from: { reveal: 'up' }, delay: 0.75, duration: 1 },
      { src: map('truck'), x: 180.9, y: 641.5, w: 80.7, h: 75.2, from: { opacity: 0, scale: 0.8 }, delay: 0.55, pulse: true },
      { src: map('dest'), x: 270.2, y: 360.3, w: 113.2, h: 116.7, from: { opacity: 0, y: -24 }, delay: 1.55 },
      { src: map('card'), x: 18.9, y: 877.6, w: 645.6, h: 410.8, from: { opacity: 0, y: 60 }, delay: 0.35 },
      { src: map('pill'), x: 122.7, y: 28.2, w: 439.3, h: 66.9, from: { opacity: 0, y: -16 }, delay: 0.15 },
    ],
  },
  // Steering: the truck glides in towards the tanks, then the instruction, then the Parking state
  'rigintel~2': {
    width: 688,
    height: 1495,
    base: anim('s2-base'),
    layers: [
      { src: anim('s2-truck'), x: 87.2, y: 469.2, w: 262.3, h: 109.3, from: { x: -140, opacity: 0 }, delay: 0.2, duration: 1.2 },
      { src: anim('s2-steer'), x: 86, y: 661, w: 528.3, h: 148.4, from: { opacity: 0, y: 16 }, delay: 1.05 },
      { src: anim('s2-pill'), x: 262.4, y: 1364.4, w: 163.1, h: 46.1, from: { opacity: 0, y: 10 }, delay: 1.35 },
    ],
  },
  // Instructions: the view dims and the sheet rises from the bottom
  'rigintel~3': {
    width: 688,
    height: 1495,
    base: anim('s3-base'),
    layers: [
      { src: anim('s3-dimmed'), x: 0, y: 0, w: 688, h: 1495, from: { opacity: 0 }, delay: 0.15, duration: 0.5 },
      { src: anim('s3-sheet'), x: 0.1, y: 505.3, w: 687.3, h: 989.8, from: { y: 990 }, delay: 0.3 },
    ],
  },
  // Parked: the truck settles into its slot, the reward floats up, then the next step and the Parked state
  'rigintel~4': {
    width: 688,
    height: 1495,
    base: anim('s4-base'),
    layers: [
      { src: anim('s4-truck'), x: 208.4, y: 477.2, w: 244.7, h: 95.9, from: { x: -36 }, delay: 0.1, duration: 0.9 },
      { src: anim('s4-icon'), x: 212.4, y: 667.5, w: 87.8, h: 52, from: { opacity: 0, scale: 0.9 }, delay: 0.7 },
      { src: anim('s4-xp'), x: 249.2, y: 343.9, w: 182.2, h: 365.2, from: { opacity: 0, y: 28 }, delay: 0.85 },
      { src: anim('s4-parked'), x: 130.1, y: 837.3, w: 422.6, h: 193.8, from: { opacity: 0, y: 16 }, delay: 1.1 },
      { src: anim('s4-pill'), x: 271, y: 1390.6, w: 144.8, h: 37.2, from: { opacity: 0, y: 10 }, delay: 1.35 },
    ],
  },
  // Inspection: the chassis comes into focus, the tyre card rises, then the issues it found
  'rigintel~5': {
    width: 690,
    height: 1509,
    base: anim('s5-base'),
    layers: [
      { src: anim('s5-chassis'), x: 85.9, y: 373.8, w: 556.9, h: 329.4, from: { opacity: 0, scale: 0.96 }, delay: 0.1, duration: 0.8 },
      { src: anim('s5-stack2'), x: 46.7, y: 781.5, w: 596.2, h: 68.1, from: { opacity: 0, y: 40 }, delay: 0.4 },
      { src: anim('s5-stack1'), x: 64.2, y: 772.1, w: 560.9, h: 64.2, from: { opacity: 0, y: 40 }, delay: 0.45 },
      { src: anim('s5-card'), x: 23.2, y: 799.8, w: 643.1, h: 504.6, from: { opacity: 0, y: 70 }, delay: 0.5 },
      { src: anim('s5-badge'), x: 338.2, y: 282.1, w: 154.6, h: 80, from: { opacity: 0, scale: 0.85 }, delay: 0.95 },
    ],
  },
};
