/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent webpack from bundling pdf-parse — it reads test files on init
    // which breaks when bundled. Uses native Node.js require() instead.
    serverComponentsExternalPackages: ["pdf-parse"],
  },

  webpack: (config) => {
    // Stub Node builtins for the browser bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
      buffer: false,
    };
    return config;
  },
};

export default nextConfig;
