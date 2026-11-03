/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: [
      "mongoose",
      "express",
      "express-rate-limit",
      "mongodb-memory-server",
      "multer",
      "bcryptjs",
      "jsonwebtoken",
      "cookie-parser",
      "cors",
      "cloudinary",
    ],
  },
};

module.exports = nextConfig;
