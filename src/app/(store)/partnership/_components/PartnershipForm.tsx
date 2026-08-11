"use client";

import { useState, useTransition, useRef } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { partnershipSchema } from "@/src/lib/validations/feedback";
import { submitPartnershipAction } from "@/src/server/actions/feedback.actions";
import { FloatingField } from "@/src/components/shared/FloatingField";

export const PartnershipForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
    } else {
      setErrors({});
    }
  };

  const handleFormAction = (formData: FormData) => {
    setHasSubmitted(true);
    setErrors({});
    setServerError(null);

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

    startTransition(async () => {
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
      action={handleFormAction}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>
      <FloatingField
        name="message"
        label="Опишите ваши задачи *"
        isTextarea
        disabled={isPending}
        error={errors.message}
        onChange={handleFieldChange}
      />
      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          "bg-brand-secondary text-foreground mt-2 h-14 w-full rounded-xl text-base font-medium",
          "disabled:cursor-not-allowed disabled:opacity-70",
          "hover:bg-brand-secondary/90 transition-all",
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
