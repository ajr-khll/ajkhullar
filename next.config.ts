import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow framing external projects in iframes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
