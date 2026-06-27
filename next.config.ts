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
};

export default nextConfig;
