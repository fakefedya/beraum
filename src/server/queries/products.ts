import "server-only";

import { z } from "zod";
import { eq, desc, asc, and, sql, or, ilike, ne, inArray } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import {
  products,
  categories,
  productImages,
  productDocuments,
} from "@/src/server/db/schema";
import { CATEGORY_FILTERS } from "@/src/lib/constants";
import { buildImageUrl } from "@/src/lib/utils";
import { unstable_cache } from "next/cache";

export type QueryErrorCode =
  | "CATEGORY_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "INVALID_REQUEST";

const filterValueSchema = z.union([z.string(), z.array(z.string())]);

const getProductsSchema = z.object({
  categorySlug: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(50).default(12),
  offset: z.number().int().min(0).default(0),
  q: z.string().max(100).optional(),
  filters: z.record(z.string(), filterValueSchema).optional(),
  sort: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val[0] : val))
    .pipe(z.enum(["newest", "price_asc", "price_desc"]).catch("newest"))
    .default("newest"),
});

const getProductByArticleSchema = z.object({
  article: z.string().min(1).max(50).trim(),
});

export type GetProductsParams = z.input<typeof getProductsSchema>;
export type CatalogProduct = Awaited<
  ReturnType<typeof getProductsDb>
>["data"][0];

const computedBasePriceSql = sql<number>`COALESCE(
  NULLIF(${products.wbDiscountedPrice}, 0),
  NULLIF(${products.manualPrice}, 0),      
  0                                        
)`;

const computedPriceSql = sql<number>`
  CASE 
    WHEN ${products.discountPercentage} > 0 THEN
      ROUND(${computedBasePriceSql} * (100.0 - ${products.discountPercentage}) / 100.0)::integer
    ELSE
      ${computedBasePriceSql}
  END
`;

const computedStockSql = sql<number>`(
  COALESCE(${products.ozonStockFbo}, 0) + 
  COALESCE(${products.fbsStock}, 0) +
  COALESCE(${products.manualStock}, 0)
)`;

const productTypeScalarSql = sql<string>`
  CASE 
    WHEN ${products.filters} ? 'type' 
    THEN COALESCE(${products.filters}->>'type', '') || ' ' || LOWER(${categories.titleRu})
    ELSE ${categories.titleRu}
  END
`;

const productTypeAggSql = sql<string>`MAX(${productTypeScalarSql})`;

async function getProductsDb(params: GetProductsParams = {}) {
  try {
    const { limit, offset, categorySlug, filters, sort, q } =
      getProductsSchema.parse(params);
    const conditions = [eq(products.status, "published")];
    const orderConditions = [];

    if (sort === "price_asc")
      orderConditions.push(asc(sql`MIN(${computedPriceSql})`));
    else if (sort === "price_desc")
      orderConditions.push(desc(sql`MIN(${computedPriceSql})`));
    else {
      orderConditions.push(desc(sql`BOOL_OR(${products.isLatest})`));
      orderConditions.push(desc(sql`MAX(${products.createdAt})`));
    }

    orderConditions.push(asc(products.siteArticle));

    if (q && q.trim().length > 0) {
      const searchTerm = `%${q.trim()}%`;
      const searchCondition = or(
        ilike(products.itemArticle, searchTerm),
        ilike(categories.titleRu, searchTerm),
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (categorySlug) {
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (!category) {
        return {
          success: false,
          code: "CATEGORY_NOT_FOUND" as const,
          error: "Категория не найдена",
          data: [],
        };
      }

      conditions.push(eq(products.categoryId, category.id));
    }

    if (filters && categorySlug && CATEGORY_FILTERS[categorySlug]) {
      const allowedFilters = CATEGORY_FILTERS[categorySlug];
      for (const [key, value] of Object.entries(filters)) {
        const filterConfig = allowedFilters.find((f) => f.key === key);
        if (!filterConfig) continue;

        const rawValuesArray = Array.isArray(value) ? value : [value];
        const valuesArray = rawValuesArray.filter((val) =>
          filterConfig.options.includes(val),
        );

        if (valuesArray.length === 0) continue;

        if (key === "color") {
          const colorConditions = valuesArray.map((val) =>
            ilike(products.colorName, `%${val}%`),
          );
          const colorClause = or(...colorConditions);
          if (colorClause) conditions.push(colorClause);
          continue;
        }

        const orConditions = valuesArray.map((val) => {
          const scalarJson = JSON.stringify({ [key]: val });
          const arrayJson = JSON.stringify({ [key]: [val] });

          return sql`(${products.filters} @> ${scalarJson}::jsonb OR ${products.filters} @> ${arrayJson}::jsonb)`;
        });

        const orClause = or(...orConditions);
        if (orClause) conditions.push(orClause);
      }
    }

    const items = await db
      .select({
        siteArticle: products.siteArticle,
        categorySlug: categories.slug,
        categoryTitle: categories.titleRu,
        productType: productTypeAggSql,
        variants: sql<
          {
            id: string;
            itemArticle: string;
            colorName: string | null;
            price: number;
            stock: number;
            isLatest: boolean;
            image: {
              fileKey: string;
              bucketName: string;
              fit: "contain" | "cover";
            } | null;
          }[]
        >`jsonb_agg(
          jsonb_build_object(
            'id', ${products.id},
            'itemArticle', ${products.itemArticle},
            'colorName', ${products.colorName},
            'isLatest', COALESCE(${products.isLatest}, false),
            'price', ${computedPriceSql},
            'stock', ${computedStockSql},
            'image', (
              SELECT jsonb_build_object(
                'fileKey', pi.file_key,
                'bucketName', pi.bucket_name,
                'fit', pi.image_fit
              )
              FROM ${productImages} pi
              WHERE pi.product_id = ${products.id}
              ORDER BY pi.is_cover DESC, pi.sort_order ASC
              LIMIT 1
            )
          ) ORDER BY ${products.itemArticle} ASC
        )`.as("variants"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(products.siteArticle, categories.slug, categories.titleRu)
      .orderBy(...orderConditions)
      .limit(limit)
      .offset(offset);

    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      code: "INTERNAL_ERROR" as const,
      error: "Ошибка при загрузке каталога",
      data: [],
    };
  }
}

export const getProducts = async (params: GetProductsParams = {}) => {
  const cacheKey = JSON.stringify(params);
  return unstable_cache(
    async () => getProductsDb(params),
    ["products_list", cacheKey],
    { tags: ["products"], revalidate: 3600 },
  )();
};

async function getProductByArticleDb(rawArticle: string) {
  try {
    const { article } = getProductByArticleSchema.parse({
      article: rawArticle,
    });

    const [product] = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        siteArticle: products.siteArticle,
        itemArticle: products.itemArticle,
        colorName: products.colorName,
        categoryTitle: categories.titleRu,
        categorySlug: categories.slug,
        productType: productTypeScalarSql.as("productType"),
        isLatest: products.isLatest,
        specifications: products.specifications,
        price: computedPriceSql.as("price"),
        ozonLink: products.ozonLink,
        manualStock: products.manualStock,
        ozonStockFbo: products.ozonStockFbo,
        wbLink: products.wbLink,
        ymarketLink: products.ymarketLink,
        mvideoLink: products.mvideoLink,
        fbsStock: products.fbsStock,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "published"),
          eq(sql`lower(${products.itemArticle})`, article.toLowerCase()),
        ),
      )
      .limit(1);

    if (!product) {
      return {
        success: false,
        code: "PRODUCT_NOT_FOUND" as const,
        error: "Товар не найден",
      };
    }

    const variantsPromise = db
      .select({
        id: products.id,
        itemArticle: products.itemArticle,
        colorName: products.colorName,
        ozonStockFbo: products.ozonStockFbo,
        fbsStock: products.fbsStock,
        manualStock: products.manualStock,
      })
      .from(products)
      .where(
        and(
          eq(products.status, "published"),
          eq(products.siteArticle, product.siteArticle),
        ),
      )
      .orderBy(products.itemArticle);

    const imagesPromise = db
      .select({
        fileKey: productImages.fileKey,
        bucketName: productImages.bucketName,
        imageFit: productImages.imageFit,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(desc(productImages.isCover), asc(productImages.sortOrder));

    const documentsPromise = db
      .select({
        type: productDocuments.type,
        fileKey: productDocuments.fileKey,
        bucketName: productDocuments.bucketName,
      })
      .from(productDocuments)
      .where(eq(productDocuments.productId, product.id));

    const [variants, rawImages, rawDocs] = await Promise.all([
      variantsPromise,
      imagesPromise,
      documentsPromise,
    ]);

    const formattedDocs = rawDocs.map((doc) => ({
      type: doc.type,
      url: buildImageUrl({ bucketName: doc.bucketName, fileKey: doc.fileKey }),
    }));

    const images = rawImages.map((img) => ({
      url: buildImageUrl({ bucketName: img.bucketName, fileKey: img.fileKey }),
      fit: (img.imageFit || "contain") as "contain" | "cover",
    }));

    return {
      success: true,
      data: { ...product, variants, documents: formattedDocs, images },
    };
  } catch (error) {
    return {
      success: false,
      code: "INVALID_REQUEST" as const,
      error: "Недопустимый запрос",
    };
  }
}

export const getProductByArticle = async (article: string) => {
  return unstable_cache(
    async () => getProductByArticleDb(article),
    ["product_article", article.toLowerCase()],
    { tags: ["products"], revalidate: 3600 },
  )();
};

export async function getSimilarProducts(
  categoryId: string,
  excludeSiteArticle: string,
  limitNum = 3,
) {
  try {
    const availableIds = await db
      .select({ siteArticle: products.siteArticle })
      .from(products)
      .where(
        and(
          eq(products.status, "published"),
          eq(products.categoryId, categoryId),
          ne(products.siteArticle, excludeSiteArticle),
        ),
      )
      .groupBy(products.siteArticle);

    if (availableIds.length === 0) {
      return { success: true, data: [] };
    }

    const shuffled = availableIds.sort(() => 0.5 - Math.random());
    const pickedArticles = shuffled
      .slice(0, limitNum)
      .map((p) => p.siteArticle);

    if (pickedArticles.length === 0) {
      return { success: true, data: [] };
    }

    const items = await db
      .select({
        siteArticle: products.siteArticle,
        categorySlug: categories.slug,
        categoryTitle: categories.titleRu,
        productType: productTypeAggSql,
        variants: sql<
          {
            id: string;
            itemArticle: string;
            colorName: string | null;
            price: number;
            stock: number;
            isLatest: boolean;
            image: {
              fileKey: string;
              bucketName: string;
              fit: "contain" | "cover";
            } | null;
          }[]
        >`jsonb_agg(
          jsonb_build_object(
            'id', ${products.id},
            'itemArticle', ${products.itemArticle},
            'colorName', ${products.colorName},
            'isLatest', COALESCE(${products.isLatest}, false),
            'price', ${computedPriceSql},
            'stock', ${computedStockSql},
            'image', (
              SELECT jsonb_build_object(
                'fileKey', pi.file_key,
                'bucketName', pi.bucket_name,
                'fit', pi.image_fit
              )
              FROM ${productImages} pi
              WHERE pi.product_id = ${products.id}
              ORDER BY pi.is_cover DESC, pi.sort_order ASC
              LIMIT 1
            )
          ) ORDER BY ${products.itemArticle} ASC
        )`.as("variants"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "published"),
          inArray(products.siteArticle, pickedArticles),
        ),
      )
      .groupBy(products.siteArticle, categories.slug, categories.titleRu);

    return { success: true, data: items };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function getSupportModelsByCategory(categoryId: string) {
  try {
    const parsedId = z.string().uuid().safeParse(categoryId);
    if (!parsedId.success) return { success: false, data: [] };

    const data = await db
      .select({
        id: products.id,
        itemArticle: products.itemArticle,
      })
      .from(products)
      .where(eq(products.categoryId, parsedId.data))
      .orderBy(asc(products.itemArticle));

    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

async function getPublishedArticlesDb() {
  const data = await db
    .select({ article: products.itemArticle })
    .from(products)
    .where(eq(products.status, "published"));
  return data.map((d) => d.article);
}

export const getPublishedArticles = unstable_cache(
  getPublishedArticlesDb,
  ["published_articles"],
  { tags: ["products"], revalidate: 3600 },
);
