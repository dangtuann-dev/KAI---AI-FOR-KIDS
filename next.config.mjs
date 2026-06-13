/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['edge-tts-universal', 'ws'],
  },
};

export default nextConfig;
