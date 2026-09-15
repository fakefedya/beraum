export const DELIVERY_METHODS = ["pickup", "delivery"] as const;
export const PAYMENT_METHODS = ["card", "cash"] as const;

export const DELIVERY_LABELS: Record<
  (typeof DELIVERY_METHODS)[number],
  string
> = {
  pickup: "Самовывоз (СПб)",
  delivery: "Доставка",
};

export const PAYMENT_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> =
  {
    card: "Банковская карта",
    cash: "Наличные",
  };
