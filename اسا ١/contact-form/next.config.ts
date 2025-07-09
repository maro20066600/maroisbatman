/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*'],
  },
  // Completely disable all development indicators
  devIndicators: false
}

module.exports = nextConfig
