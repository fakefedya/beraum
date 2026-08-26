import type { MetadataRoute } from "next";
import { clientEnv } from "@/src/lib/env/client";

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: [
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
        ],
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: ["CCBot", "GPTBot", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
