import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  reactCompiler: true,
  output: 'export',
  // Base path for GitHub Pages deployment (matches repo name)
  // Only apply in production to make local dev easier
  basePath: process.env.NODE_ENV === 'production' ? '/mech-guide-gemini-3' : undefined,
  // Disable server-side image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
