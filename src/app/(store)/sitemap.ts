import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/src/server/queries/products";
import { getCategoriesList } from "@/src/server/queries/categories";
import { clientEnv } from "@/src/lib/env/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  const staticPages = [
    "",
    "/about",
    "/faq",
    "/service",
    "/support",
    "/partnership",
    "/discount",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 🛡️ ЗАЩИТА: Блокируем обращение к БД при сборке Docker-образа
  if (process.env.SKIP_DB_PREFETCH === "1") {
    return staticPages;
  }

  // В Runtime этот блок отработает штатно
  const [products, categoriesRes] = await Promise.all([
    getPublishedArticles(),
    getCategoriesList(),
  ]);

  const categoryPages = (categoriesRes.data || []).map((cat) => ({
    url: `${base}/catalog/${cat.slug}`,
    lastModified: new Date(),
    priority: 0.9,
  }));

  const productPages = products.map((article) => ({
    url: `${base}/product/${article.toLowerCase()}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
