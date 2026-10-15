import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server build (.next/standalone) so the Docker image
  // carries only the files it needs to run `node server.js`.
  output: 'standalone',
  images: {
    /* School photographs are served from Cloudinary. The per-image loader in
       src/lib/cloudinary.ts builds these URLs; this entry is what allows them. */
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
  /* Each class once had a page of its own; they are now one Programs page.
     The old addresses stay alive for bookmarks and search results: 308s to
     the class's card on /programs (the #ids are on AgeCards). The two pages
     with no class card go to the top of the page. A trailing-slash form such
     as /infants/ is stripped to /infants by Next first, then lands here. */
  async redirects() {
    return [
      { source: '/infants', destination: '/programs#baby-class', permanent: true },
      { source: '/toddlers', destination: '/programs#middle-class', permanent: true },
      { source: '/preschool', destination: '/programs#top-class', permanent: true },
      { source: '/kindergarten', destination: '/programs#primary-school', permanent: true },
      { source: '/flex-care', destination: '/programs', permanent: true },
      { source: '/art-program', destination: '/programs', permanent: true },
    ];
  },
};

export default nextConfig;
