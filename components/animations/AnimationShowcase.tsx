"use client";

import { motion, useReducedMotion } from "framer-motion";
import BorderlessValueCards from "./BorderlessValueCards";

const contentTracks = [
  {
    title: "Travel & Mobility",
    description: "Routes, platforms, and services that help people move across cities, borders, and daily routines.",
    color: "#E31D1C",
    icon: "route",
  },
  {
    title: "Payments Infrastructure",
    description: "Deep dive into the systems moving people across borders, cities, and economies.",
    color: "#7421F9",
    icon: "money",
  },
  {
    title: "Expansion & Growth",
    description: "Market entry, partner motion, and operating models for teams scaling into new regions.",
    color: "#23C65D",
    icon: "leaf",
  },
  {
    title: "Fintech & Product Strategy",
    description: "Product decisions, user trust, and financial workflows built for durable adoption.",
    color: "#3195F9",
    icon: "card",
  },
  {
    title: "Commerce & Logistics",
    description: "Retail, delivery, and fulfillment systems connecting demand with reliable operations.",
    color: "#FB9120",
    icon: "truck",
  },
  {
    title: "Next-Gen Payments",
    description: "Emerging payment experiences, wallets, rails, and checkout behavior for modern customers.",
    color: "#E31D1C",
    icon: "wallet",
  },
] as const;

export default function AnimationShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      <StackFrame index="01" wide>
        <ContentTracksStudy reduceMotion={shouldReduceMotion} />
      </StackFrame>
      <StackFrame index="02" wide>
        <BorderlessValueCards />
      </StackFrame>
    </main>
  );
}

function StackFrame({ children, index, wide = false }: { children: React.ReactNode; index: string; wide?: boolean }) {
  return (
    <section className="relative grid min-h-screen place-items-center px-5 py-16 sm:px-8">
      <div className="absolute left-5 top-5 font-archivo text-sm font-semibold text-[#8d8377] sm:left-8 sm:top-8">
        {index}
      </div>
      <div className={`w-full ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</div>
    </section>
  );
}

function ContentTracksStudy({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#f4f1eb] px-5 py-12 sm:px-8 lg:px-10">
      <div className="relative mx-auto max-w-5xl">
        <h2 className="text-center font-archivo text-4xl font-semibold leading-none text-[#171717] sm:text-5xl">
          Content Tracks
        </h2>

        <motion.div
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
          }}
        >
          {contentTracks.map((track) => (
            <ContentTrackCard key={track.title} track={track} reduceMotion={reduceMotion} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ContentTrackCard({
  track,
  reduceMotion,
}: {
  track: (typeof contentTracks)[number];
  reduceMotion: boolean | null;
}) {
  const hoverY = reduceMotion ? 0 : -18;
  const descriptionY = reduceMotion ? 0 : 14;

  return (
    <motion.article
      className="group relative min-h-56 overflow-hidden rounded-[1.65rem] border border-[#e6dfd3] bg-white/55 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none backdrop-blur-sm sm:min-h-64"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      whileFocus="hover"
      whileTap="hover"
      tabIndex={0}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0 bg-white/55 opacity-0"
        variants={{ hover: { opacity: 1 } }}
        transition={{ duration: 0.28 }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <TrackIcon icon={track.icon} color={track.color} />

        <motion.div
          variants={{ hover: { y: hoverY } }}
          transition={{ type: "spring", stiffness: 330, damping: 28 }}
        >
          <h3 className="max-w-[13rem] text-3xl font-medium leading-[1.04] tracking-normal text-[#171717] sm:text-[2rem]">
            {track.title}
          </h3>
          <motion.p
            className="mt-4 max-w-[15rem] text-sm font-medium leading-5 text-[#706a60]"
            initial={{ opacity: reduceMotion ? 1 : 0, y: descriptionY }}
            animate={reduceMotion ? { opacity: 1, y: 0 } : undefined}
            variants={{ hover: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {track.description}
          </motion.p>
        </motion.div>
      </div>
    </motion.article>
  );
}

function TrackIcon({ icon, color }: { icon: (typeof contentTracks)[number]["icon"]; color: string }) {
  return (
    <motion.svg
      aria-hidden="true"
      className="h-10 w-10 text-[#8b7474]"
      viewBox="0 0 48 48"
      fill="none"
      variants={{ hover: { color } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {icon === "route" && (
        <>
          <path d="M12 12l6 22 5-9 10 9 3-3-10-9 9-5-23-5z" fill="currentColor" />
          <path d="M8 36h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </>
      )}
      {icon === "money" && (
        <>
          <rect x="7" y="12" width="34" height="24" rx="4" stroke="currentColor" strokeWidth="4" />
          <circle cx="24" cy="24" r="6" fill="currentColor" />
          <circle cx="14" cy="18" r="2.5" fill="currentColor" />
          <circle cx="34" cy="30" r="2.5" fill="currentColor" />
        </>
      )}
      {icon === "leaf" && (
        <>
          <path d="M36 10c-11 1-22 6-23 18-.5 6 3 10 9 10 12 0 15-16 14-28z" fill="currentColor" />
          <path d="M13 37c5-9 12-15 22-21" stroke="#f4f1eb" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {icon === "card" && (
        <>
          <rect x="8" y="14" width="32" height="22" rx="4" fill="currentColor" />
          <path d="M8 21h32" stroke="#f4f1eb" strokeWidth="4" />
          <path d="M14 30h8" stroke="#f4f1eb" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {icon === "truck" && (
        <>
          <path d="M7 16h23v17H7zM30 22h7l5 6v5H30z" fill="currentColor" />
          <circle cx="15" cy="36" r="4" fill="currentColor" />
          <circle cx="35" cy="36" r="4" fill="currentColor" />
        </>
      )}
      {icon === "wallet" && (
        <>
          <rect x="8" y="14" width="32" height="24" rx="5" fill="currentColor" />
          <path d="M28 22h12v10H28c-4 0-6-2-6-5s2-5 6-5z" fill="#f4f1eb" opacity="0.95" />
          <circle cx="31" cy="27" r="2" fill="currentColor" />
        </>
      )}
    </motion.svg>
  );
}
