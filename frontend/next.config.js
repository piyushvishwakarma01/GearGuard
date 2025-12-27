/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    // Environment variables are injected at build time
    // NEXT_PUBLIC_API_URL should be set in Render environment
};

module.exports = nextConfig;
