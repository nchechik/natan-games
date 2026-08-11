import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@natan-games/farm-game", "@natan-games/game-core"],
};

export default nextConfig;
