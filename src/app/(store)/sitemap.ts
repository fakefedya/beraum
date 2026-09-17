import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/src/server/queries/products";
import { getCategoriesList } from "@/src/server/queries/categories";
import { getAvailableDiscountSkus } from "@/src/server/queries/discount";
import { clientEnv } from "@/src/lib/env/client";

// Защита от DoS: кэшируем sitemap на 1 час.
export const revalidate = 3600;

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
    "/discount/catalog", // Индексация корня дисконта для SEO
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    priority: route === "" ? 1.0 : route.includes("discount") ? 0.9 : 0.8,
  }));

  // Блокируем падение Docker-сборки
  if (process.env.SKIP_DB_PREFETCH === "1") {
    return staticPages;
  }

  // Параллельный сбор данных для ISR
  const [products, categoriesRes, discountSkus] = await Promise.all([
    getPublishedArticles(),
    getCategoriesList(),
    getAvailableDiscountSkus(),
  ]);

  const categoryPages = (categoriesRes.data || []).map((cat) => ({
    url: `${base}/catalog/${cat.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const productPages = products.map((article) => ({
    url: `${base}/product/${article.toLowerCase()}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const discountPages = discountSkus.map((item) => ({
    url: `${base}/discount/${item.uniqueSku.toLowerCase()}`,
    lastModified: item.updatedAt || new Date(),
    priority: 0.9, // Высокий приоритет для акционных товаров
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...discountPages];
}
