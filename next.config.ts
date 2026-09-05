import type { NextConfig } from "next";

const storageUrlStr =
  process.env.NEXT_PUBLIC_STORAGE_URL || "https://s3.beraum.com";
const storageUrl = new URL(storageUrlStr);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: storageUrl.protocol.replace(":", "") as "http" | "https",
        hostname: storageUrl.hostname,
        port: storageUrl.port || "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
