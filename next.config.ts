import type { NextConfig } from 'next';

// A fully static site: `next build` writes plain HTML/JS/CSS to out/, which
// GitHub Pages serves (see .github/workflows/deploy.yml).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // /about/ -> out/about/index.html, which Pages serves as-is
  images: { unoptimized: true },
};

export default nextConfig;
