// Refreshes the Avatars scenes' art (components/stageshow/avatars/assets.ts) from ~/avatar-builder:
// the hairstyle tiles, the headwear tiles and the All colours wheel. Everything else in assets.ts
// (baked swatches, colour wheels, bar icons) is kept as it is.
//   node scripts/avatars-assets.mjs
import fs from 'fs';

const LIB = process.env.AVATAR_BUILDER || `${process.env.HOME}/avatar-builder`;
const FILE = new URL('../components/stageshow/avatars/assets.ts', import.meta.url);
const Av = await import(`${LIB}/src/lib/avatar.js`);

const src = fs.readFileSync(FILE, 'utf8');
const at = src.indexOf('export const A = ') + 'export const A = '.length;
// the A object's JSON runs from `at` to its matching closing brace
let depth = 0, end = at, inStr = false;
for (; end < src.length; end++) {
  const ch = src[end];
  if (inStr) { if (ch === '\\') end++; else if (ch === '"') inStr = false; continue; }
  if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}' && !--depth) break;
}
end++;
const A = JSON.parse(src.slice(at, end));

// The grey an option is drawn in until it's chosen (the editor's UNPICKED), and the scene's colours
const GREY = '#9ea1a9', INK = '#2b2b2b', GREEN = '#50c810', PINK = '#f70492';
const tile = (inner, view) => `<svg viewBox="${view}" width="40" height="40" aria-hidden="true">${inner.replace(/(\d+\.\d{2})\d+/g, '$1')}</svg>`;

// Four of the woman's hairstyles from the Editable Avatars set, named for the scene
const HAIRS = { ponytail: '1', bob: '3', bun: '4', wavy: '5' };
const hair = (colour) => Object.fromEntries(Object.entries(HAIRS).map(([name, v]) => [name, tile(Av.itemSvg('hair', { category: 'woman', hair: v, hairColor: colour }), Av.ITEM_VIEWS.hair)]));
A.hairTiles = { black: hair(GREY), ink: hair(INK), green: hair(GREEN) };

// Headwear: the man's hat and the woman's hijab, grey until chosen, then in the headwear colour
const wear = (category, headwear, colour) => tile(Av.itemSvg('headwear', { category, headwear, wearColor: colour }), Av.ITEM_VIEWS.headwear);
A.hatTiles = { hat: wear('man', 'hat', GREY), hatOn: wear('man', 'hat', PINK), hijab: wear('woman', 'hijab', GREY) };

// The All colours button: the editor's rainbow wheel with its white stopper (icons.jsx ColourWheel)
const icons = fs.readFileSync(`${LIB}/src/lib/icons.jsx`, 'utf8');
const SPECTRUM = icons.match(/const SPECTRUM = '([^']+)'/)[1];
const SHINE = icons.match(/<path d="(M28 14C28 21\.732[^"]+)"/)[1];
A.wheel.spectrum = `<svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true"><defs><linearGradient id="av-spec-g" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="av-spec-f" x="3.5" y="4.5" width="21" height="21" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy=".5" stdDeviation=".75" flood-color="#000" flood-opacity=".18"/></filter></defs><image href="${SPECTRUM}" width="28" height="28"/><path d="${SHINE}" fill="url(#av-spec-g)"/><g filter="url(#av-spec-f)"><circle cx="14" cy="14" r="9" fill="#fff"/><circle cx="14" cy="14" r="8.5" fill="none" stroke="#000" stroke-opacity=".8"/></g></svg>`;

fs.writeFileSync(FILE, src.slice(0, at) + JSON.stringify(A) + src.slice(end));
console.log('assets.ts: hair', Object.keys(HAIRS).join(','), '| hats', Object.keys(A.hatTiles).join(','), '| spectrum wheel');
