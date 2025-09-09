import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['hrghmxifjkbkhurxmzhy.supabase.co'],
  },
  webpack: (config: { resolve: { alias: { [x: string]: unknown; }; }; }) => {
    if (config.resolve && config.resolve.alias) {
      config.resolve.alias['@'] = path.resolve(__dirname);
    }
    return config;
  },
}

module.exports = nextConfig