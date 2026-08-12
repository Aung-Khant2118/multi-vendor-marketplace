/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // This creates static files
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;