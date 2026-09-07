import { z } from "zod";
import { VALID_MARKETPLACES } from "@/src/lib/constants/marketplaces";

const VALID_CONDITIONS = ["new", "discount"] as const;

const hasNoLongWords = (val: string | undefined) => {
  if (!val) return true;
  return !val.split(/\s+/).some((word) => word.length > 15);
};

const hasNormalCasing = (val: string) => {
  return !/[a-z][A-Z]{2,}[a-z]/g.test(val);
};

const baseFeedbackSchema = z.object({
  botCheck: z.string().optional(),

  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя слишком длинное")
    .regex(/^[а-яА-ЯёЁa-zA-Z\s-]+$/, "Недопустимые символы в имени")
    .refine(hasNormalCasing, "Некорректный формат имени")
    .refine(
      (val) => !/^[a-zA-Z]{15,}$/.test(val),
      "Имя похоже на сгенерированное",
    ),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, "Неверный формат телефона")
    .min(10, "Слишком короткий номер телефона"),
  email: z.string().email("Укажите корректный email"),
  message: z
    .string()
    .max(2000, "Сообщение слишком длинное")
    .refine(hasNoLongWords, "Сообщение содержит неестественно длинные слова")
    .optional(),

  consent: z.literal("on", {
    message: "Необходимо согласие на обработку персональных данных",
  }),
});

export const consultSchema = baseFeedbackSchema.extend({
  sourcePage: z
    .string()
    .trim()
    .max(255, "Путь слишком длинный")
    .startsWith("/", "Путь должен быть относительным")
    .refine(
      (val) => !val.startsWith("//"),
      "Protocol-relative ссылки запрещены",
    )
    .default("/"), // Fallback, если поля вдруг нет
});

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

  deviceCondition: z.enum(
    VALID_CONDITIONS,
    "Укажите тип приобретенной техники",
  ),

  address: z
    .string()
    .min(5, "Укажите точный адрес для выезда мастера")
    .max(255)
    .optional(),

  categoryId: z
    .string({
      error: "Выберите категорию устройства",
    })
    .uuid("Выберите категорию устройства"),

  marketplace: z.enum(VALID_MARKETPLACES, "Укажите место покупки"),
  purchaseDate: z.coerce
    .date({
      error: "Неверный формат даты",
    })
    .max(new Date(), "Дата покупки не может быть в будущем")
    .min(new Date("2015-01-01"), "Проверьте дату покупки"),

  mediaKeys: z.array(z.string()).optional(),
});

export const wholesaleSchema = baseFeedbackSchema.extend({
  city: z.string().min(2, "Укажите город").max(100),
  techType: z.enum(["working", "broken", "both"], "Выберите тип техники"),
});
