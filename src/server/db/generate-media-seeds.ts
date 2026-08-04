import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SEED_DATA_DIR = path.join(process.cwd(), "src/server/db/data");
const ASSETS_DIR = path.join(process.cwd(), "backup/seed-assets/products");

// 🛡️ Security: Строгий белый список расширений и типов документов
const ALLOWED_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const ALLOWED_DOC_EXT = new Set([".pdf"]);

// Обязательно "as const", чтобы TS видел здесь литералы, а не просто string
const ALLOWED_DOC_TYPES = new Set([
  "certificate",
  "service_instruction",
  "user_instruction",
] as const);

// Вытаскиваем union-тип прямо из Set'а
type DocumentType = typeof ALLOWED_DOC_TYPES extends Set<infer T> ? T : never;

// 🛡️ Строгие контракты данных
type ProductSeed = {
  id: string;
  item_article: string;
};

type ImageSeed = {
  id: string;
  product_id: string;
  bucket_name: string;
  file_key: string;
  image_fit: "contain" | "cover";
  is_cover: boolean;
  sort_order: number;
  created_at: string;
};

type DocumentSeed = {
  id: string;
  product_id: string;
  type: DocumentType;
  title: string;
  bucket_name: string;
  file_key: string;
  created_at: string;
};

// 🛡️ Security: Type Guard для runtime и compile-time проверки папок
function isValidDocType(type: string): type is DocumentType {
  return ALLOWED_DOC_TYPES.has(type as DocumentType);
}

function generateSeeds() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Директория ${ASSETS_DIR} не найдена.`);
    process.exit(1);
  }

  const productsFilePath = path.join(SEED_DATA_DIR, "products.json");
  if (!fs.existsSync(productsFilePath)) {
    console.error(
      `❌ Файл ${productsFilePath} не найден. Сначала выполните экспорт товаров.`,
    );
    process.exit(1);
  }

  const productsRaw = fs.readFileSync(productsFilePath, "utf-8");
  // Избавляемся от any раз и навсегда
  const productsData: ProductSeed[] = JSON.parse(productsRaw);

  const imagesSeed: ImageSeed[] = [];
  const documentsSeed: DocumentSeed[] = [];
  let processedArticles = 0;

  for (const product of productsData) {
    // 🛡️ Защита от Path Traversal
    const article = path.basename(product.item_article);
    const productDir = path.join(ASSETS_DIR, article);

    if (!fs.existsSync(productDir)) continue;

    processedArticles++;

    // --- Обработка Изображений ---
    const imagesDir = path.join(productDir, "images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!ALLOWED_IMAGE_EXT.has(ext)) {
          console.warn(
            `⚠️ Пропущен подозрительный файл: ${file} (Артикул: ${article})`,
          );
          continue;
        }

        const name = path.basename(file, ext);
        const isCover = name === "cover";
        // 🛡️ Всегда указываем radix (10) для безопасности парсинга
        const sortOrder = isCover ? 0 : parseInt(name, 10);

        if (!isCover && isNaN(sortOrder)) {
          console.warn(
            `⚠️ Неверный формат имени (ожидается число или 'cover'): ${file} в ${article}`,
          );
        }

        imagesSeed.push({
          id: crypto.randomUUID(),
          product_id: product.id,
          bucket_name: "products",
          file_key: `${article}/images/${file}`,
          image_fit: "contain", // по умолчанию
          is_cover: isCover,
          sort_order: isNaN(sortOrder) ? 99 : sortOrder,
          created_at: new Date().toISOString(),
        });
      }
    }

    // --- Обработка Документов ---
    const docsDir = path.join(productDir, "docs");
    if (fs.existsSync(docsDir)) {
      const docTypes = fs.readdirSync(docsDir);

      for (const docType of docTypes) {
        // Используем Type Guard (теперь TypeScript уверен, что docType это правильный Literal)
        if (!isValidDocType(docType)) {
          console.warn(
            `⚠️ Неизвестная папка документации: ${docType} в ${article}`,
          );
          continue;
        }

        const typeDir = path.join(docsDir, docType);
        const files = fs.readdirSync(typeDir);

        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (!ALLOWED_DOC_EXT.has(ext)) {
            console.warn(
              `⚠️ Документ должен быть PDF: ${file} (Артикул: ${article})`,
            );
            continue;
          }

          documentsSeed.push({
            id: crypto.randomUUID(),
            product_id: product.id,
            type: docType,
            title: path.basename(file, ext),
            bucket_name: "products",
            file_key: `${article}/docs/${docType}/${file}`,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  fs.writeFileSync(
    path.join(SEED_DATA_DIR, "product_images.json"),
    JSON.stringify(imagesSeed, null, 2),
  );
  fs.writeFileSync(
    path.join(SEED_DATA_DIR, "product_documents.json"),
    JSON.stringify(documentsSeed, null, 2),
  );

  console.log(`✅ Обработано артикулов: ${processedArticles}`);
  console.log(`🖼️ Сгенерировано изображений: ${imagesSeed.length}`);
  console.log(`📄 Сгенерировано документов: ${documentsSeed.length}`);
}

generateSeeds();
