import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove swcMinify (removed in Next 16)
  // Disable Turbopack to use webpack for compatibility with our plugins
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
