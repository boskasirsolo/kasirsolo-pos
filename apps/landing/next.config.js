/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kasirsolo/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
