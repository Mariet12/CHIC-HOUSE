/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
    unoptimized: false, // يمكن تغييره إلى true إذا كانت الصور لا تعمل
  },
}

module.exports = nextConfig
