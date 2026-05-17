/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15: React 19 is the default, no need to set reactStrictMode manually
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
