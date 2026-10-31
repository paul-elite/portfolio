import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shown on the home page as "Updated <date>": the moment this build ran.
  env: { SITE_UPDATED: new Date().toISOString() },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'xvemgsowtgjnnwpgzjve.supabase.co',
      },
    ],
  },
};

export default nextConfig;
