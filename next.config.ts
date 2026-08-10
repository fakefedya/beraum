// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     dangerouslyAllowLocalIP: true,
//     qualities: [75, 95],
//     formats: ["image/avif", "image/webp"],

//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "9000",
//         pathname: "/system-assets/**",
//       },
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "9000",
//         pathname: "/products/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const storageUrlStr =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:9000";
const storageUrl = new URL(storageUrlStr);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],

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
