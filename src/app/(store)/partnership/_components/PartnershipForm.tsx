"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

// Strict Schema validation
const formSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\)]{10,20}$/, "Некорректный формат телефона"),
  company: z.string().max(150).optional(),
  message: z.string().max(1000, "Слишком длинное сообщение").optional(),
});

type FormData = z.infer<typeof formSchema>;

export const PartnershipForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      message: formData.get("message") as string,
    };

    // Клиентская валидация
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Здесь должен быть вызов Server Action
      // await submitPartnershipAction(parsed.data);

      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Submission error", error);
      // Обработка серверных ошибок
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card border-brand/50 animate-in fade-in zoom-in flex flex-col items-center justify-center rounded-[24px] border p-12 text-center duration-500">
        <h3 className="mb-2 text-2xl font-medium">Заявка отправлена!</h3>
        <p className="text-muted-foreground">
          Мы свяжемся с вами в ближайшее время.
        </p>
        <Button
          variant="outline"
          className="mt-6 h-12 rounded-[12px] px-6"
          onClick={() => setSuccess(false)}
        >
          Отправить еще
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            name="name"
            placeholder="Ваше имя *"
            disabled={isSubmitting}
            className={cn(
              "bg-card text-foreground placeholder:text-muted-foreground h-14 w-full rounded-[16px] px-6 text-base transition-colors outline-none",
              "focus:ring-2 focus:ring-black/20",
              errors.name && "ring-destructive ring-2",
            )}
          />
          {errors.name && (
            <span className="text-destructive px-2 text-sm">{errors.name}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            type="tel"
            name="phone"
            placeholder="Телефон *"
            disabled={isSubmitting}
            className={cn(
              "bg-card text-foreground placeholder:text-muted-foreground h-14 w-full rounded-[16px] px-6 text-base transition-colors outline-none",
              "focus:ring-2 focus:ring-black/20",
              errors.phone && "ring-destructive ring-2",
            )}
          />
          {errors.phone && (
            <span className="text-destructive px-2 text-sm">
              {errors.phone}
            </span>
          )}
        </div>
      </div>

      <input
        type="text"
        name="company"
        placeholder="Компания / ИНН (опционально)"
        disabled={isSubmitting}
        className="bg-card text-foreground placeholder:text-muted-foreground h-14 w-full rounded-[16px] px-6 text-base transition-colors outline-none focus:ring-2 focus:ring-black/20"
      />

      <textarea
        name="message"
        placeholder="Опишите ваши задачи или задайте вопрос..."
        rows={4}
        disabled={isSubmitting}
        className={cn(
          "bg-card text-foreground placeholder:text-muted-foreground w-full resize-none rounded-[24px] p-6 text-base transition-colors outline-none",
          "focus:ring-2 focus:ring-black/20",
          errors.message && "ring-destructive ring-2",
        )}
      />
      {errors.message && (
        <span className="text-destructive px-2 text-sm">{errors.message}</span>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-foreground text-background hover:bg-foreground/90 h-14 w-full rounded-[16px] text-base font-medium transition-all disabled:opacity-70"
      >
        {isSubmitting ? "Отправка..." : "Оставить заявку"}
      </Button>

      <p className="text-muted-foreground mt-2 text-center text-xs">
        Нажимая кнопку, вы соглашаетесь с Политикой конфиденциальности.
      </p>
    </form>
  );
};
