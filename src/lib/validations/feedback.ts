import { z } from "zod";

const sanitizeText = (val: string) => val.replace(/[<>]/g, "").trim();
const RU_PHONE_REGEX =
  /^(?:\+7|8|7)[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

export const partnershipSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(100, "Слишком длинное имя")
    .transform(sanitizeText),

  phone: z
    .string()
    .regex(RU_PHONE_REGEX, "Введите корректный номер")
    .transform((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    }),

  email: z
    .string()
    .email("Некорректный формат почты")
    .max(150)
    .transform((val) => val.toLowerCase()),

  company: z
    .string()
    .min(2, "Введите название компании или ИНН")
    .max(150, "Слишком длинное название")
    .transform(sanitizeText),

  message: z
    .string()
    .min(10, "Опишите ваши задачи подробнее (минимум 10 символов)")
    .max(500, "Сообщение не должно превышать 500 символов")
    .transform(sanitizeText),
});
