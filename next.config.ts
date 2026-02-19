import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1aaa9d335091441c9942432c8ada78a9.r2.dev",
        pathname: "/products/**",
      },
    ],
  },
};

export default nextConfig;
