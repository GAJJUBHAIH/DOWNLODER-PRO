import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repoName = "";

if (isGithubActions) {
  // Extract repository name from GITHUB_REPOSITORY (e.g., "GAJJUBHAIH/DOWNLODER-PRO")
  const repo = process.env.GITHUB_REPOSITORY;
  repoName = repo ? `/${repo.split("/")[1]}` : "";
}

const nextConfig: NextConfig = {
  // Allow accessing the dev server from phone on the same network
  allowedDevOrigins: ["192.168.31.100"],
  
  ...(isGithubActions && {
    output: "export",
    basePath: repoName,
    assetPrefix: repoName,
  }),

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

export default nextConfig;
