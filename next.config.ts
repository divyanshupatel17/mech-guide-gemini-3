import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  reactCompiler: true,
  output: 'export',
  // Base path for GitHub Pages deployment (matches repo name)
  basePath: '/mech-guide-gemini-3',
  // Disable server-side image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
