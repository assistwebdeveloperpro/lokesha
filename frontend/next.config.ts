import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.1.20:8000/api";
const apiOrigin = new URL(API_BASE_URL);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.20","localhost"],
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/uploads/**",
      },
    ],
    // Local uploads resolve to a private IP while developing
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
