/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        // Esto ayuda a Turbopack a encontrar las exportaciones de Clerk
        '@clerk/nextjs': '@clerk/nextjs/dist/esm/index.js',
      },
    },
  },
};

module.exports = nextConfig;
