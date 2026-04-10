import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'wmsorjdhrzqtkhkxqbdj.supabase.co',
      },
    ],
  },
};

export default nextConfig;
