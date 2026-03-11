import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper image optimization
  images: {
    unoptimized: false,
  },
  // Generate standalone output for better Vercel compatibility
  output: undefined,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Enable React strict mode
  reactStrictMode: true,
  // Trailing slash consistency
  trailingSlash: false,
};

export default nextConfig;
