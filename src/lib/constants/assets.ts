export const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

export const SYSTEM_ASSETS = {
  emptyProduct: `${STORAGE_URL}/system-assets/shared/placeholders/empty-product.jpg`,
  emptyResult: `${STORAGE_URL}/system-assets/shared/states/empty-result.png`,
} as const;
