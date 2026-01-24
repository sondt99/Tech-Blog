/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hackmd.io',
        pathname: '/_uploads/**'
      },
      {
        protocol: 'https',
        hostname: 'tmdpc.vn',
        pathname: '/media/**'
      }
    ]
  }
};

export default nextConfig;
