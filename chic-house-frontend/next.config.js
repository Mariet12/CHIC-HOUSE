/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kerolosadel12-002-site1.qtempurl.com',
      },
      {
        protocol: 'https',
        hostname: 'elctroapp.runasp.net',
      },
      {
        protocol: 'https',
        hostname: 'chic-house.runasp.net',
      },
    ],
    unoptimized: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
}

module.exports = nextConfig
