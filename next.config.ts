import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    /* School photographs are served from Cloudinary. The per-image loader in
       src/lib/cloudinary.ts builds these URLs; this entry is what allows them. */
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
};

export default nextConfig;
