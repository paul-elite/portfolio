'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

export interface RadialToolkitItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  onSelect: () => void;
}

interface RadialToolkitProps {
  anchor: { x: number; y: number } | null;
  items: RadialToolkitItem[];
  open: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const edgePadding = 24;
const angleStep = 2;
const minimumAngleSpacing = 34;
const maxLabelWidth = 132;
const itemHeight = 42;
const iconSize = 42;
const iconAnchorInset = 21;
const activeArcScale = 0.75;
const preferredLaneGap = 58;
const savedBorderShadow = '0 0 0 0.5px rgb(0 0 0 / 10%)';

type RadialLayout = {
  angle: number;
  point: { x: number; y: number };
  iconOnRight: boolean;
};

function getViewportSize() {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function getPoint(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function getShortestAngleDistance(a: number, b: number) {
  const distance = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(distance, 360 - distance);
}

function getItemWidth(label: string) {
  return Math.min(maxLabelWidth, Math.max(78, label.length * 7.2 + 16)) + iconSize + 10;
}

function getOrbitRadius(viewport: { width: number; height: number }) {
  return Math.max(108, Math.min(146, Math.min(viewport.width, viewport.height) * 0.19));
}

function getIconOnRight(angle: number) {
  return Math.cos((angle * Math.PI) / 180) < -0.06;
}

function getViewportMargin(
  angle: number,
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
  itemWidth: number,
  iconOnRight: boolean,
) {
  const point = getPoint(angle, radius);
  const x = center.x + point.x;
  const y = center.y + point.y;
  const left = iconOnRight ? x - itemWidth + iconAnchorInset : x - iconAnchorInset;
  const right = left + itemWidth;

  return Math.min(
    left - edgePadding,
    viewport.width - edgePadding - right,
    y - itemHeight / 2 - edgePadding,
    viewport.height - edgePadding - (y + itemHeight / 2),
  );
}

function angleFitsViewport(
  angle: number,
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
  itemWidth: number,
  iconOnRight: boolean,
) {
  return getViewportMargin(angle, center, viewport, radius, itemWidth, iconOnRight) >= 0;
}

function getEvenCircleAngles(
  count: number,
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
  items: RadialToolkitItem[],
) {
  if (count <= 0) return [];

  const spacing = 360 / count;
  let bestAngles: number[] | null = null;
  let bestScore = -Infinity;

  for (let rotation = -180; rotation < 180; rotation += angleStep) {
    const angles = Array.from({ length: count }, (_, index) => rotation + index * spacing);
    const margins = angles.map((angle, index) => {
      const item = items[index];
      return getViewportMargin(angle, center, viewport, radius, getItemWidth(item.label), getIconOnRight(angle));
    });
    const fitted = margins.filter((margin) => margin >= 0).length;
    const activeBias = -getShortestAngleDistance(angles[0], -90) / 120;
    const marginScore = margins.reduce((sum, margin) => sum + Math.min(32, margin), 0) / 28;
    const score = fitted * 200 + marginScore + activeBias;

    if (score > bestScore) {
      bestScore = score;
      bestAngles = angles;
    }
  }

  return bestAngles ?? [];
}

function getVerticalBalancedAngles(start: number, end: number, count: number) {
  if (count <= 1) return [(start + end) / 2];

  const startSin = Math.sin((start * Math.PI) / 180);
  const endSin = Math.sin((end * Math.PI) / 180);

  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const y = startSin + (endSin - startSin) * progress;
    return (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
  });
}

function getPreferredSideArcAngles(
  count: number,
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
  items: RadialToolkitItem[],
) {
  const sideArcs = [
    { start: -82, end: 82 },
    { start: -98, end: 98 },
    { start: -112, end: 112 },
  ];

  for (const arc of sideArcs) {
    const angles = getVerticalBalancedAngles(arc.start, arc.end, count);
    const fits = angles.every((angle, index) => {
      const item = items[index];
      return angleFitsViewport(angle, center, viewport, radius, getItemWidth(item.label), getIconOnRight(angle));
    });

    if (fits) return angles;
  }

  return null;
}

function getBestArcAngles(
  count: number,
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
  items: RadialToolkitItem[],
) {
  if (count <= 0) return [];

  const preferredArcAngles = getPreferredSideArcAngles(count, center, viewport, radius, items);

  if (preferredArcAngles) return preferredArcAngles;

  const candidateAngles = Array.from({ length: 180 }, (_, index) => -180 + index * angleStep);
  const fittingAngles = candidateAngles.filter((angle) => {
    return items.every((item) => {
      return angleFitsViewport(angle, center, viewport, radius, getItemWidth(item.label), getIconOnRight(angle));
    });
  });

  if (!fittingAngles.length) {
    return getEvenCircleAngles(count, center, viewport, radius * 0.76, items);
  }

  const runs = fittingAngles.reduce<number[][]>((acc, angle) => {
    const currentRun = acc[acc.length - 1];
    const previousAngle = currentRun?.[currentRun.length - 1];

    if (!currentRun || previousAngle === undefined || angle - previousAngle > angleStep) {
      acc.push([angle]);
    } else {
      currentRun.push(angle);
    }

    return acc;
  }, []);
  const longestRun = runs.reduce((best, run) => (run.length > best.length ? run : best), runs[0]);
  const rawStart = longestRun[0];
  const rawEnd = longestRun[longestRun.length - 1];
  const neededSpan = Math.max(minimumAngleSpacing * Math.max(1, count - 1), count === 1 ? 0 : 112);
  const availableSpan = Math.max(0, rawEnd - rawStart);
  const span = Math.min(availableSpan, Math.max(neededSpan, availableSpan - 14));
  const midpoint = rawStart + availableSpan / 2;
  const start = midpoint - span / 2;
  const end = midpoint + span / 2;
  const step = count === 1 ? 0 : span / (count - 1);

  if (start >= -90 && end <= 90) {
    return getVerticalBalancedAngles(start, end, count);
  }

  return Array.from({ length: count }, (_, index) => start + step * index);
}

function getFittingAngles(
  items: RadialToolkitItem[],
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
) {
  const count = items.length;
  const arcAngles = getBestArcAngles(count, center, viewport, radius, items);

  if (count <= 5 && arcAngles.length === count) return arcAngles;

  const circleAngles = getEvenCircleAngles(count, center, viewport, radius, items);
  const allFit = circleAngles.every((angle, index) => {
    const item = items[index];
    return angleFitsViewport(angle, center, viewport, radius, getItemWidth(item.label), getIconOnRight(angle));
  });

  if (allFit) return circleAngles;

  return arcAngles;
}

function getConicAngle(angle: number) {
  return angle + 90;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLaneLayouts(
  items: RadialToolkitItem[],
  center: { x: number; y: number },
  viewport: { width: number; height: number },
  radius: number,
): RadialLayout[] {
  if (!items.length) return [];

  const widestItem = Math.max(...items.map((item) => getItemWidth(item.label)));
  const rightMargin = viewport.width - edgePadding - (center.x + radius - iconAnchorInset + widestItem);
  const leftMargin = center.x - radius - widestItem + iconAnchorInset - edgePadding;
  const placeOnRight = rightMargin >= leftMargin;
  const sign = placeOnRight ? 1 : -1;
  const iconOnRight = !placeOnRight;

  const verticalOrbitLimit = radius * 0.84;
  const viewportTop = edgePadding + itemHeight / 2 - center.y;
  const viewportBottom = viewport.height - edgePadding - itemHeight / 2 - center.y;
  const usableTop = Math.max(-verticalOrbitLimit, viewportTop);
  const usableBottom = Math.min(verticalOrbitLimit, viewportBottom);
  const usableHeight = Math.max(0, usableBottom - usableTop);
  const gap = items.length > 1 ? Math.min(preferredLaneGap, usableHeight / (items.length - 1)) : 0;
  const span = gap * Math.max(0, items.length - 1);
  const start = clamp(-span / 2, usableTop, usableBottom - span);

  return items.map((_, index) => {
    const y = items.length > 1 ? start + index * gap : clamp(0, usableTop, usableBottom);
    const x = sign * Math.sqrt(Math.max(0, radius * radius - y * y));
    const angle = (Math.atan2(y, x) * 180) / Math.PI;

    return {
      angle,
      point: { x, y },
      iconOnRight,
    };
  });
}

export default function RadialToolkit({ anchor, items, open, onClose, onMouseEnter, onMouseLeave }: RadialToolkitProps) {
  const reduceMotion = useReducedMotion();
  const [viewport, setViewport] = useState(getViewportSize);

  useEffect(() => {
    if (!open) return;

    const updateViewport = () => setViewport(getViewportSize());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const center = useMemo(() => {
    const fallback = {
      x: viewport.width / 2,
      y: viewport.height / 2,
    };
    return anchor || fallback;
  }, [anchor, viewport.height, viewport.width]);

  const orbitRadius = useMemo(() => getOrbitRadius(viewport), [viewport]);
  const layouts = useMemo(() => {
    if (items.length <= 6) return getLaneLayouts(items, center, viewport, orbitRadius);

    return getFittingAngles(items, center, viewport, orbitRadius).map((angle) => ({
      angle,
      point: getPoint(angle, orbitRadius),
      iconOnRight: getIconOnRight(angle),
    }));
  }, [center, items, orbitRadius, viewport]);
  const activeIndex = Math.max(0, items.findIndex((item) => item.active));
  const activeItem = items[activeIndex];
  const activeAngle = layouts[activeIndex]?.angle ?? -90;
  const activeArcLength = Math.max(24, Math.min(54, (360 / Math.max(1, items.length) - 18) * activeArcScale));

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 520, damping: 31, mass: 0.78 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close radial toolkit"
            className="fixed inset-0 z-[160] cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.66)',
            }}
          />

          <motion.div
            aria-label="Radial navigation toolkit"
            role="menu"
            className="fixed z-[170] h-[1px] w-[1px]"
            initial={false}
            animate={{ left: center.x, top: center.y }}
            transition={transition}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full bg-[#f7f7f7]/95 backdrop-blur-sm"
              initial={{ scale: 0.5, opacity: 0, rotate: -32 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.78, opacity: 0, rotate: -20 }}
              transition={transition}
              style={{
                width: orbitRadius * 1.5,
                height: orbitRadius * 1.5,
                marginLeft: orbitRadius * -0.75,
                marginTop: orbitRadius * -0.75,
                boxShadow: savedBorderShadow,
              }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full"
              initial={{ scale: 0.35, opacity: 0, rotate: -82 }}
              animate={{ scale: 1, opacity: 1, rotate: getConicAngle(activeAngle) - activeArcLength / 2 }}
              exit={{ scale: 0.55, opacity: 0, rotate: -55 }}
              transition={transition}
              style={{
                width: orbitRadius * 1.28,
                height: orbitRadius * 1.28,
                marginLeft: orbitRadius * -0.64,
                marginTop: orbitRadius * -0.64,
                background: `conic-gradient(#2388e8 0deg ${activeArcLength}deg, transparent ${activeArcLength}deg 360deg)`,
              }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full bg-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={transition}
              style={{
                width: orbitRadius * 0.96,
                height: orbitRadius * 0.96,
                marginLeft: orbitRadius * -0.48,
                marginTop: orbitRadius * -0.48,
                boxShadow: savedBorderShadow,
              }}
            />

            <motion.button
              type="button"
              aria-label="Close radial toolkit"
              className="absolute left-1/2 top-1/2 z-[173] flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-[#2388e8] bg-white text-[#2388e8]"
              onClick={onClose}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.55, opacity: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={transition}
              style={{ marginLeft: -29, marginTop: -29 }}
            >
              <span className="flex h-7 w-7 items-center justify-center">
                {activeItem?.icon}
              </span>
            </motion.button>

            {items.map((item, index) => {
              const layout = layouts[index] ?? { angle: -90, point: getPoint(-90, orbitRadius), iconOnRight: false };
              const orbitPoint = layout.point;
              const iconOnRight = layout.iconOnRight;
              const active = Boolean(item.active);
              const itemWidth = getItemWidth(item.label);

              return (
                <motion.div
                  key={item.id}
                  className="group absolute left-0 top-0 flex items-center justify-center"
                  initial={{ x: 0, y: 0, scale: 0.42, opacity: 0 }}
                  animate={{ x: orbitPoint.x, y: orbitPoint.y, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0.45, opacity: 0 }}
                  style={{ zIndex: 174 }}
                  transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.035 }}
                >
                  <motion.button
                    type="button"
                    role="menuitem"
                    aria-label={item.label}
                    onClick={item.onSelect}
                    className="absolute left-0 top-0 flex h-[42px] items-center justify-between gap-2 whitespace-nowrap rounded-full bg-[#f7f7f7]/95 text-sm font-normal text-gray-800 outline-none transition-colors hover:bg-[#f7f7f7] hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-[#2388e8]/40"
                    style={{
                      width: itemWidth,
                      marginLeft: iconOnRight ? -itemWidth + iconAnchorInset : -iconAnchorInset,
                      marginTop: itemHeight / -2,
                      paddingLeft: iconOnRight ? 8 : 4,
                      paddingRight: iconOnRight ? 4 : 8,
                      boxShadow: savedBorderShadow,
                    }}
                    whileHover={{ scale: 1.065, y: -2, boxShadow: savedBorderShadow }}
                    whileTap={{ scale: 0.94 }}
                    transition={transition}
                  >
                    {!iconOnRight && (
                      <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white ${active ? 'text-[#2388e8]' : 'text-gray-700'}`}>
                        {item.icon}
                      </span>
                    )}
                    <span className={`min-w-0 flex-1 truncate ${iconOnRight ? 'text-right' : 'text-left'}`}>
                      {item.label}
                    </span>
                    {iconOnRight && (
                      <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white ${active ? 'text-[#2388e8]' : 'text-gray-700'}`}>
                        {item.icon}
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
