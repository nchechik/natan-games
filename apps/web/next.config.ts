import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@natan-games/farm-game",
    "@natan-games/game-core",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-spring/three",
  ],
};

export default nextConfig;
