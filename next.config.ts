import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server from phone on the same network
  allowedDevOrigins: ["192.168.31.100"],
};

export default nextConfig;
