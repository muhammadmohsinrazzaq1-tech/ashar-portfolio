import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The CMS lets admins paste image URLs (Supabase storage, CDNs).
    // next/image optimizes them; SVGs stay disabled for safety.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
