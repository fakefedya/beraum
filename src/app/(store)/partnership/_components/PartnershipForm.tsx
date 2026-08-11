"use client";

import { useState, useTransition, useRef } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { partnershipSchema } from "@/src/lib/validations/feedback";
import { submitPartnershipAction } from "@/src/server/actions/feedback.actions";

// Внутренний UI-компонент для инкапсуляции логики Floating Label (Apple Style)
const FloatingField = ({
  name,
  label,
  type = "text",
  error,
  disabled,
  isTextarea = false,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  isTextarea?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) => {
  const commonClasses = cn(
    "peer w-full rounded-xl border bg-transparent px-4 pt-6 pb-2 text-base text-foreground outline-none transition-all duration-200",
    "border-black/20 focus:border-blue-600 focus:ring-1 focus:ring-blue-600",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
  );

  const labelClasses = cn(
    "absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-[0.8] transform text-muted-foreground transition-all duration-200 pointer-events-none",
    "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
    "peer-focus:-translate-y-2.5 peer-focus:scale-[0.8] peer-focus:text-blue-600",
    error && "text-red-500 peer-focus:text-red-500",
  );

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="relative w-full">
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            placeholder=" " // Критично для работы peer-placeholder-shown
            disabled={disabled}
            onChange={onChange}
            rows={4}
            className={cn(commonClasses, "resize-none")}
            aria-invalid={!!error}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder=" " // Критично для работы peer-placeholder-shown
            disabled={disabled}
            onChange={onChange}
            className={cn(commonClasses, "h-14")}
            aria-invalid={!!error}
          />
        )}
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      </div>

      {/* Вывод ошибки в стиле Apple (с иконкой) */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-1 text-sm text-red-500 opacity-0 transition-opacity duration-300",
          error && "opacity-100",
        )}
      >
        {error && (
          <>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
};

export const PartnershipForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Флаг для включения Aggressive Validation после первой неудачной отправки
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Валидация "на лету", если юзер уже пытался отправить форму
  const handleFieldChange = () => {
    if (!hasSubmitted || !formRef.current) return;

    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());

    const parsed = partnershipSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrors({});
    setServerError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 1. Клиентская Zod-валидация
    const parsed = partnershipSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. Server Action
    startTransition(async () => {
      // 🔥 АРХИТЕКТУРНЫЙ ФИКС: Отправляем raw `data`, а не `parsed.data`.
      // Сервер сам валидирует и трансформирует номер.
      const result = await submitPartnershipAction(data);

      if (result.success) {
        setSuccess(true);
        setHasSubmitted(false);
      } else {
        setServerError(result.error || "Произошла критическая ошибка");
      }
    });
  };

  if (success) {
    return (
      <div className="bg-card/50 animate-in fade-in zoom-in-95 flex flex-col items-center justify-center rounded-[24px] p-12 text-center duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-3 text-3xl font-medium tracking-tight">
          Заявка отправлена
        </h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          Спасибо за интерес. Наш менеджер свяжется с вами в ближайшее время.
        </p>
        <Button
          variant="outline"
          className="mt-8 h-12 rounded-xl px-8"
          onClick={() => setSuccess(false)}
        >
          Отправить еще
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4"
      noValidate
    >
      {serverError && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FloatingField
          name="name"
          label="ФИО *"
          disabled={isPending}
          error={errors.name}
          onChange={handleFieldChange}
        />
        <FloatingField
          name="phone"
          label="Телефон *"
          type="tel"
          disabled={isPending}
          error={errors.phone}
          onChange={handleFieldChange}
        />
      </div>

      <FloatingField
        name="email"
        label="Электронная почта *"
        type="email"
        disabled={isPending}
        error={errors.email}
        onChange={handleFieldChange}
      />

      <FloatingField
        name="company"
        label="Компания / ИНН *"
        disabled={isPending}
        error={errors.company}
        onChange={handleFieldChange}
      />

      <FloatingField
        name="message"
        label="Опишите ваши задачи..."
        isTextarea
        disabled={isPending}
        error={errors.message}
        onChange={handleFieldChange}
      />

      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          "bg-foreground text-background hover:bg-foreground/90 mt-2 h-14 w-full rounded-xl text-lg font-medium transition-all",
          "disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {isPending ? "Отправка..." : "Оставить заявку"}
      </Button>

      <p className="text-muted-foreground mt-2 text-center text-sm">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a
          href="/policies/privacy"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          Политикой конфиденциальности
        </a>
        .
      </p>
    </form>
  );
};
