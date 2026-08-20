import { z } from "zod";

const sanitizeText = (val: string) => val.replace(/<[^>]*>?/gm, "").trim();

const RU_PHONE_REGEX =
  /^(?:\+7|8|7)[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

const baseContactSchema = z.object({
  name: z
    .string({ message: "Укажите ФИО" })
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(100, "Слишком длинное имя")
    .transform(sanitizeText),

  phone: z
    .string({ message: "Укажите телефон" })
    .regex(RU_PHONE_REGEX, "Введите корректный номер РФ")
    .transform((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    }),

  email: z
    .string({ message: "Укажите почту" })
    .email("Некорректный формат почты")
    .max(150)
    .transform((val) => val.toLowerCase()),

  consent: z.unknown().refine((val) => val === "on", {
    message: "Необходимо согласие на обработку персональных данных",
  }),
});

// 2. Схема для формы "Сотрудничество"
export const partnershipSchema = baseContactSchema.extend({
  company: z
    .string()
    .max(150, "Слишком длинное название")
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return sanitizeText(val);
    }),

  message: z
    .string({ message: "Опишите ваши задачи" })
    .min(10, "Опишите ваши задачи подробнее (минимум 10 символов)")
    .max(500, "Сообщение не должно превышать 500 символов")
    .transform(sanitizeText),
});

// 3. Схема для формы "Поддержка"
export const supportSchema = baseContactSchema.extend({
  categoryId: z
    .string({ message: "Выберите категорию устройства" })
    .min(1, "Выберите категорию устройства"),

  marketplace: z
    .string({ message: "Укажите место покупки" })
    .min(1, "Укажите место покупки"),

  purchaseDate: z
    .string({ message: "Укажите дату покупки" })
    .min(1, "Укажите дату покупки"),

  modelArticle: z
    .string({ message: "Выберите модель" })
    .min(1, "Выберите или введите модель устройства"),

  address: z
    .string({ message: "Введите адрес" })
    .min(5, "Введите полный адрес")
    .max(255)
    .transform(sanitizeText),

  message: z
    .string({ message: "Опишите неисправность" })
    .min(10, "Опишите неисправность подробнее (минимум 10 символов)")
    .max(2000, "Описание не должно превышать 2000 символов")
    .transform(sanitizeText),

  mediaKeys: z.array(z.string()).max(5, "Максимум 5 файлов").optional(),
});

// 4. Схема для формы "Консультация"
export const consultSchema = baseContactSchema.extend({
  message: z
    .string({ message: "Напишите ваш вопрос" })
    .min(10, "Вопрос слишком короткий (минимум 10 символов)")
    .max(1000, "Вопрос не должен превышать 1000 символов")
    .transform(sanitizeText),

  sourcePage: z
    .string()
    .startsWith("/", "Некорректный путь")
    .max(255)
    .optional(),
});

export const parseZodErrors = (zodError: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};
  zodError.issues.forEach((issue) => {
    if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
  });
  return fieldErrors;
};
