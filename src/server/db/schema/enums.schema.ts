import { pgEnum } from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "user_instruction",
  "service_instruction",
  "certificate",
]);

export const slideTypeEnum = pgEnum("slide_type", [
  "promo_product",
  "promo_information",
]);
export const slidePlacementEnum = pgEnum("slide_placement", [
  "home_hero",
  "catalog_hero",
]);

export const requestTypeEnum = pgEnum("request_type", [
  "consultation",
  "partnership",
  "support",
  "wholesale",
]);

export const discountItemStatusEnum = pgEnum("discount_item_status", [
  "available",
  "reserved",
  "sold",
]);
