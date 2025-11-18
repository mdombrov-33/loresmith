import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, //* TEMPORARY: Disabled to prevent double-mount cancelling long-running requests
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
    ],
  },
};

export default nextConfig;
