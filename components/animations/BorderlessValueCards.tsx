"use client";

import { motion, useReducedMotion } from "framer-motion";

const valueCards = [
  {
    title: "Curated, Not Crowded",
    body: "Every attendee is vetted.\nNo filler, no spectators.",
    illustration: "curated",
  },
  {
    title: "Capital Meets Execution",
    body: "Not theory. Real operators.\nReal investors. Real deals.",
    illustration: "capital",
  },
  {
    title: "Global Lens",
    body: "Connect beyond local ecosystems — think cross-border scale from day one.",
    illustration: "global",
  },
] as const;

export default function BorderlessValueCards() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {valueCards.map((card) => (
          <ValueCard key={card.title} card={card} reduceMotion={reduceMotion} />
        ))}
      </div>
    </section>
  );
}

function ValueCard({
  card,
  reduceMotion,
}: {
  card: (typeof valueCards)[number];
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      className="group grid min-h-[31rem] overflow-hidden rounded-[1.75rem] border border-black/[0.04] bg-white shadow-[0_18px_44px_rgba(20,20,20,0.05)] outline-none"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="hover"
      tabIndex={0}
      transition={{ duration: 0.25 }}
    >
      <div className="relative min-h-72 overflow-hidden px-6 pt-7">
        {card.illustration === "curated" && <CuratedIllustration reduceMotion={reduceMotion} />}
        {card.illustration === "capital" && <CapitalIllustration reduceMotion={reduceMotion} />}
        {card.illustration === "global" && <GlobalIllustration reduceMotion={reduceMotion} />}
      </div>

      <div className="self-end px-7 pb-8">
        <h2 className="font-archivo text-3xl font-semibold leading-none text-[#292929]">{card.title}</h2>
        <p className="mt-5 whitespace-pre-line text-xl font-medium leading-[1.12] text-[#706a60]">{card.body}</p>
      </div>
    </motion.article>
  );
}

function CuratedIllustration({ reduceMotion }: { reduceMotion: boolean | null }) {
  const avatars = [
    { x: 18, y: 90, size: 48, src: "https://randomuser.me/api/portraits/women/44.jpg", delay: 0 },
    { x: 80, y: 56, size: 52, src: "https://randomuser.me/api/portraits/men/32.jpg", delay: 0.08 },
    { x: 150, y: 92, size: 50, src: "https://randomuser.me/api/portraits/women/65.jpg", delay: 0.18 },
    { x: 232, y: 58, size: 52, src: "https://randomuser.me/api/portraits/men/75.jpg", delay: 0.28 },
    { x: 252, y: 150, size: 48, src: "https://randomuser.me/api/portraits/women/17.jpg", delay: 0.38 },
    { x: 142, y: 172, size: 58, src: "https://randomuser.me/api/portraits/women/79.jpg", delay: 0.48, selected: true },
    { x: 58, y: 178, size: 50, src: "https://randomuser.me/api/portraits/men/46.jpg", delay: 0.58 },
  ];

  return (
    <div className="relative mx-auto h-72 max-w-[21rem]">
      {avatars.map((avatar) => (
        <motion.div
          key={`${avatar.x}-${avatar.y}`}
          className="absolute overflow-hidden rounded-full bg-[#d7d7d7]"
          style={{
            left: avatar.x,
            top: avatar.y,
            width: avatar.size,
            height: avatar.size,
          }}
          variants={{
            rest: {
              filter: avatar.selected ? "saturate(0.95)" : "grayscale(1) opacity(0.62)",
              scale: 1,
            },
            hover: {
              filter: avatar.selected ? "saturate(1.15)" : ["grayscale(1) opacity(0.62)", "grayscale(0) opacity(1)", "grayscale(1) opacity(0.62)"],
              scale: avatar.selected ? 1.08 : [1, 1.04, 1],
              transition: reduceMotion
                ? { duration: 0 }
                : { delay: avatar.delay, duration: avatar.selected ? 0.35 : 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar.src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      ))}
      <motion.div
        className="absolute left-[11.75rem] top-[13.35rem] grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#08a564] text-white shadow-sm"
        variants={{ rest: { opacity: 0, scale: 0.8 }, hover: { opacity: 1, scale: 1 } }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.25 8.25 6.4 11.4l6.35-6.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-[4.8rem] top-[7.5rem] h-32 w-32"
        variants={{
          rest: { x: 0, y: 0, rotate: 0 },
          hover: reduceMotion
            ? { x: 58, y: 38, rotate: 0 }
            : { x: [0, 68, 154, 58], y: [0, -74, -35, 38], rotate: 0 },
        }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <HandleLens />
      </motion.div>
    </div>
  );
}

function HandleLens() {
  return (
    <svg className="h-full w-full" viewBox="0 0 152 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g filter="url(#handle-shadow)">
        <rect x="51.9531" y="7.9668" width="76.8" height="76.8" rx="38.4" fill="white" />
        <circle cx="89.9318" cy="47.0408" r="45.84" transform="rotate(42.576 89.9318 47.0408)" fill="white" stroke="white" strokeWidth="2.4" />
        <circle cx="89.9318" cy="47.0408" r="41.64" transform="rotate(42.576 89.9318 47.0408)" fill="white" stroke="black" strokeWidth="6" />
        <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M63.628 75.6711C79.4402 90.199 104.036 89.1578 118.563 73.3456C133.091 57.5334 132.05 32.938 116.238 18.4102C115.869 18.0714 115.496 17.7411 115.118 17.4192C128.754 31.0155 128.511 54.0051 114.322 69.4486C100.133 84.892 77.246 87.0775 62.5459 74.6386C62.8986 74.9881 63.2593 75.3324 63.628 75.6711Z" fill="white" />
        <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M115.116 17.4156C114.79 17.0909 114.457 16.7717 114.115 16.458C99.4743 3.00631 75.8283 4.91987 61.3005 20.732C46.7727 36.5442 46.8644 60.2673 61.5053 73.719C61.8467 74.0326 62.193 74.3379 62.544 74.6349C47.7738 59.9973 47.1115 36.1755 61.3005 20.732C75.4896 5.28859 99.2822 3.93528 115.116 17.4156Z" fill="white" />
        <rect x="54.8281" y="72.4766" width="18" height="9.36" rx="2.88" transform="rotate(42.576 54.8281 72.4766)" fill="black" />
        <rect width="12.24" height="9.36" transform="matrix(0.736381 0.676567 0.676567 -0.736381 44.2832 88.209)" fill="#02560C" />
        <rect x="5.80273" y="130.094" width="12.24" height="10.08" rx="5.04" transform="rotate(42.576 5.80273 130.094)" fill="#02560C" />
        <rect width="18" height="66.96" rx="2.88" transform="matrix(0.736381 0.676567 0.676567 -0.736381 -1.18945 133.447)" fill="#036E43" />
        <path fillRule="evenodd" clipRule="evenodd" d="M87.666 10.9937C80.0736 11.6597 73.3416 14.3273 67.6464 18.9173C61.6164 23.7809 57.1776 30.7253 55.3488 38.1629C54.5712 41.3345 54.3516 43.2389 54.3516 46.9073C54.3516 50.5757 54.5712 52.4801 55.3488 55.6517C58.5384 68.6369 69.1692 79.0589 82.194 81.9713C85.2324 82.6517 86.8272 82.8209 90.258 82.8209C93.6888 82.8209 95.2836 82.6517 98.322 81.9713C111.347 79.0589 121.978 68.6369 125.167 55.6517C125.934 52.5233 126.161 50.5649 126.168 46.9793C126.172 43.4657 126.013 41.9249 125.322 38.8433C123.673 31.4669 119.353 24.3533 113.586 19.5149C107.02 14.0033 99.492 11.1593 91.05 10.9901C89.9222 10.9579 88.7937 10.9591 87.666 10.9937ZM106.638 33.0149C108.078 33.4433 109.126 34.9229 109.122 36.5285C109.118 37.9541 109.198 37.8641 97.7244 49.3085C87.0864 59.9213 87.0144 59.9897 86.1864 60.2273C85.3484 60.4876 84.4433 60.426 83.6484 60.0545C83.0112 59.7953 72.4128 49.2905 71.88 48.3905C71.5334 47.7755 71.3752 47.0723 71.4252 46.3683C71.4751 45.6642 71.7309 44.9903 72.1608 44.4305C72.8916 43.4693 73.6908 43.0913 74.994 43.0913C75.9084 43.0913 76.1748 43.1489 76.722 43.4765C77.0784 43.6889 79.1196 45.6185 81.258 47.7605L85.1424 51.6593L94.218 42.6017C99.2076 37.6193 103.517 33.4325 103.794 33.2921C104.874 32.7485 105.529 32.6837 106.638 33.0149Z" fill="#03AA64" />
      </g>
      <defs>
        <filter id="handle-shadow" x="0" y="0" width="151.973" height="159.436" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="12" dy="12" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

function CapitalIllustration({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="relative mx-auto mt-4 h-72 max-w-[22rem] overflow-hidden rounded-[1.35rem] border border-[#e8e8e8] bg-white">
      <div className="absolute left-5 top-8 text-xl font-semibold text-[#b8b8b8]">+24,500</div>
      <div className="absolute right-5 top-9 flex items-center gap-2">
        <span className="h-5 w-5 rounded-full bg-[#e8e8e8]" />
        <span className="h-2 w-12 rounded-full bg-[#e8e8e8]" />
      </div>
      <svg className="absolute inset-x-0 bottom-0 h-56 w-full" viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true">
        {[42, 88, 134, 180].map((y) => (
          <path key={y} d={`M0 ${y}H360`} stroke="#ededed" strokeDasharray="10 10" />
        ))}
        <motion.path
          d="M0 202 C32 170 48 176 78 158 C104 144 108 166 132 152 C154 139 148 112 166 128 C184 146 190 137 196 108 C204 70 230 70 244 104 C254 130 262 72 288 54 C314 35 335 28 360 18 L360 220 L0 220 Z"
          fill="#dff8ea"
          initial={{ opacity: 1, pathLength: 1 }}
          variants={{
            rest: { opacity: 1, pathLength: 1 },
            hover: { opacity: [0, 1], pathLength: [0, 1] },
          }}
          transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M0 202 C32 170 48 176 78 158 C104 144 108 166 132 152 C154 139 148 112 166 128 C184 146 190 137 196 108 C204 70 230 70 244 104 C254 130 262 72 288 54 C314 35 335 28 360 18"
          fill="none"
          stroke="#55d49a"
          strokeWidth="2"
          initial={{ pathLength: 1 }}
          variants={{ rest: { pathLength: 1 }, hover: { pathLength: [0, 1] } }}
          transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <motion.div
        className="absolute bottom-0 top-8 w-px bg-[#45d7aa]"
        variants={{ rest: { left: "74%", opacity: 1 }, hover: { left: ["27%", "74%"], opacity: [0, 1] } }}
        transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute h-4 w-4 rounded-full border-2 border-white bg-[#35c979] shadow-sm"
        variants={{
          rest: { left: "73%", top: "52%", opacity: 1 },
          hover: { left: ["27%", "73%"], top: ["70%", "52%"], opacity: [0, 1] },
        }}
        transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function GlobalIllustration({ reduceMotion }: { reduceMotion: boolean | null }) {
  const flags = [
    { code: "us", x: 73, y: 61, orbit: [[0, 0], [34, -22], [76, 8], [36, 42], [0, 0]] },
    { code: "ng", x: 223, y: 47, orbit: [[0, 0], [26, 36], [-20, 70], [-58, 16], [0, 0]] },
    { code: "fr", x: 213, y: 143, orbit: [[0, 0], [36, 32], [4, 76], [-45, 28], [0, 0]] },
    { code: "ma", x: 39, y: 160, orbit: [[0, 0], [-22, -35], [20, -74], [62, -20], [0, 0]] },
    { code: "ke", x: 224, y: 213, orbit: [[0, 0], [-46, 26], [-88, -8], [-26, -50], [0, 0]] },
    { code: "ss", x: 302, y: 157, orbit: [[0, 0], [-22, 52], [-78, 34], [-48, -28], [0, 0]] },
  ];

  return (
    <div className="relative mx-auto h-72 max-w-[22rem] overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8d8d8]"
        variants={{ rest: { scale: 1, boxShadow: "0 0 0 rgba(21,185,120,0)" }, hover: { scale: 1.08, boxShadow: "0 0 30px rgba(21,185,120,0.26)" } }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
      />
      {[82, 146, 212, 278].map((size) => (
        <motion.div
          key={size}
          className="absolute left-1/2 top-1/2 rounded-full border border-[#dedede]"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
          variants={{ rest: { scale: 1, opacity: 0.9 }, hover: { scale: reduceMotion ? 1 : 1.035, opacity: 1 } }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {flags.map((flag) => (
        <FlagMark key={flag.code} code={flag.code} x={flag.x} y={flag.y} orbit={flag.orbit} reduceMotion={reduceMotion} />
      ))}
    </div>
  );
}

function FlagMark({
  code,
  x,
  y,
  orbit,
  reduceMotion,
}: {
  code: string;
  x: number;
  y: number;
  orbit: number[][];
  reduceMotion: boolean | null;
}) {
  const flagEmoji: Record<string, string> = {
    us: "🇺🇸",
    ng: "🇳🇬",
    fr: "🇫🇷",
    ma: "🇲🇦",
    ke: "🇰🇪",
    ss: "🇸🇸",
  };
  const baseClass = "absolute grid h-11 w-16 place-items-center rounded-lg bg-white text-[2.45rem] leading-none shadow-[0_3px_10px_rgba(0,0,0,0.08)]";
  const orbitTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 16, ease: "linear" as const, repeat: Infinity };
  const motionProps = {
    variants: {
      rest: { x: 0, y: 0, rotate: 0 },
      hover: {
        x: orbit.map(([orbitX]) => orbitX),
        y: orbit.map(([, orbitY]) => orbitY),
        rotate: 0,
      },
    },
    transition: orbitTransition,
  };

  return (
    <motion.div className={baseClass} style={{ left: x, top: y }} {...motionProps}>
      {flagEmoji[code] || "🏳️"}
    </motion.div>
  );
}
