import { z } from "zod";
import { VALID_MARKETPLACES } from "@/src/lib/constants/marketplaces";

const baseFeedbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, "Неверный формат телефона")
    .min(10, "Слишком короткий номер телефона"),
  email: z.string().email("Укажите корректный email"),
  message: z.string().max(2000, "Сообщение слишком длинное").optional(),

  consent: z.literal("on", {
    message: "Необходимо согласие на обработку персональных данных",
  }),
});

export const consultSchema = baseFeedbackSchema;

export const partnershipSchema = baseFeedbackSchema.extend({
  company: z.string().max(150, "Слишком длинное название").optional(),
  inn: z
    .string()
    .regex(/^\d{10,12}$/, "ИНН должен содержать 10 или 12 цифр")
    .optional(),
});

export const supportSchema = baseFeedbackSchema.extend({
  modelArticle: z
    .string({ message: "Укажите артикул" })
    .min(1, "Укажите артикул")
    .max(100),

  serialNumber: z.string().max(100).optional(),

  address: z
    .string()
    .min(5, "Укажите точный адрес для выезда мастера")
    .max(255)
    .optional(),

  categoryId: z.string().uuid("Выберите категорию устройства"),
  marketplace: z.enum(VALID_MARKETPLACES, "Укажите место покупки"),
  purchaseDate: z.coerce
    .date()
    .max(new Date(), "Дата покупки не может быть в будущем")
    .min(new Date("2015-01-01"), "Проверьте дату"),

  mediaKeys: z.array(z.string()).optional(),
});

export const wholesaleSchema = baseFeedbackSchema.extend({
  city: z.string().min(2, "Укажите город").max(100),
  techType: z.enum(["working", "broken", "both"], "Выберите тип техники"),
});
