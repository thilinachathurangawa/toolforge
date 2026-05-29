/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers handled in vercel.json
};

module.exports = nextConfig;
