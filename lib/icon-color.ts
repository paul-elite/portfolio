// Finds the most abundant colour in an icon so a link can take on its icon's colour on hover.
// Works for any icon the nav renders: an <img> (uploaded SVG/PNG) or an inline <svg>. The icon
// is rasterised to a small canvas and its opaque pixels are bucketed; white glyph details are
// ignored so a white-on-blue mark reads as blue. Icons drawn in currentColor have no colour of
// their own, so they return null (the link keeps its normal ink).

const SIZE = 32;
const cache = new Map<string, Promise<string | null>>();

function loadImage(src: string, crossOrigin: boolean) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function luminance([r, g, b]: number[]) {
  const c = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// Text in this colour has to stay readable on the white sidebar: darken very light colours
// until they reach at least 3:1 against white.
function readable(rgb: number[]) {
  let [r, g, b] = rgb;
  for (let i = 0; i < 20 && 1.05 / (luminance([r, g, b]) + 0.05) < 3; i++) {
    r *= 0.9;
    g *= 0.9;
    b *= 0.9;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function dominant(img: HTMLImageElement): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  } catch {
    return null; // a cross-origin image without CORS can't be read
  }

  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue;
    if (r > 235 && g > 235 && b > 235) continue; // white glyph details, not the icon's colour
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const bucket of buckets.values()) if (!best || bucket.n > best.n) best = bucket;
  if (!best) return null;
  return readable([best.r / best.n, best.g / best.n, best.b / best.n]);
}

/** The icon's most abundant colour as an rgb() string, or null if it has none of its own. */
export function iconColor(container: Element | null): Promise<string | null> {
  if (!container) return Promise.resolve(null);

  const img = container.querySelector('img');
  if (img?.currentSrc || img?.src) {
    const src = img.currentSrc || img.src;
    if (!cache.has(src)) {
      const sameOrigin = new URL(src, location.href).origin === location.origin;
      cache.set(src, loadImage(src, !sameOrigin).then(dominant).catch(() => null));
    }
    return cache.get(src)!;
  }

  const svg = container.querySelector('svg');
  if (svg) {
    const markup = new XMLSerializer().serializeToString(svg);
    // Line icons drawn entirely in currentColor follow the text; they have no colour to lend.
    if (!/fill="#|stroke="#|fill="rgb|stroke="rgb|style="[^"]*#/i.test(markup)) return Promise.resolve(null);
    if (!cache.has(markup)) {
      const sized = markup
        .replace(/^<svg([^>]*?)\s(width|height)="[^"]*"/, '<svg$1')
        .replace(/^<svg([^>]*?)\s(width|height)="[^"]*"/, '<svg$1')
        .replace('<svg', `<svg width="${SIZE}" height="${SIZE}"`);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
      cache.set(markup, loadImage(url, false).then(dominant).catch(() => null));
    }
    return cache.get(markup)!;
  }

  return Promise.resolve(null);
}
