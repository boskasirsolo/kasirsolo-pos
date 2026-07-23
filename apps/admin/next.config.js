/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kasirsolo/db", "@kasirsolo/ui", "@kasirsolo/utils"],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
