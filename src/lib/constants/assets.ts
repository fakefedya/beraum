export const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:9000";

export const SYSTEM_ASSETS = {
  emptyProduct: `${STORAGE_URL}/shared/placeholders/empty-product.jpg`,
  emptyResult: `${STORAGE_URL}/shared/placeholders/states/empty-result.png`,
  // placeholder: `${STORAGE_URL}/system-assets/placeholder.png`,
  // emptyStateCover: `${STORAGE_URL}/system-assets/empty_state_cover.png`,
} as const;
