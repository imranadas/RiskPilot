/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to use native Node.js require() for pdf-parse instead of
  // bundling it through Webpack — avoids the test-file preloading side-effect.
  serverExternalPackages: ["pdf-parse"],

  webpack: (config) => {
    // Stub Node builtins for the browser bundle (client components, etc.)
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
