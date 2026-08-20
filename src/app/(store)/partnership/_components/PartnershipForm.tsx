"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { submitPartnershipAction } from "@/src/server/actions/feedback.actions";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { cn } from "@/src/lib/utils";
import { Checkbox } from "@/src/components/ui/checkbox";

export const PartnershipForm = () => {
  const [state, formAction, isPending] = useActionState(
    submitPartnershipAction,
    {
      success: false,
    },
  );

  if (state.success) {
    return (
      <div className="bg-card/50 animate-in fade-in zoom-in-95 flex flex-col items-center justify-center rounded-[24px] p-12 text-center duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-3 text-3xl font-medium">Заявка отправлена</h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          Наш менеджер свяжется с вами в ближайшее время.
        </p>
        <Button
          className={cn(
            "bg-foreground text-background mt-8 h-12 w-fit rounded-xl px-8",
            "hover:bg-foreground/80 transition-colors duration-300",
          )}
          onClick={() => window.location.reload()}
        >
          Отправить еще
        </Button>
      </div>
    );
  }

  return (
    <form
      id="partnership-form"
      action={formAction}
      className="flex w-full max-w-3xl flex-col gap-4"
      noValidate
    >
      {state.error && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FloatingField
          name="name"
          label="Имя"
          disabled={isPending}
          error={state.fieldErrors?.name}
          defaultValue={state.payload?.name as string}
        />
        <FloatingField
          name="phone"
          label="Телефон"
          type="tel"
          disabled={isPending}
          error={state.fieldErrors?.phone}
          defaultValue={state.payload?.phone as string}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FloatingField
          name="email"
          label="Электронная почта"
          type="email"
          disabled={isPending}
          error={state.fieldErrors?.email}
          defaultValue={state.payload?.email as string}
        />
        <FloatingField
          isRequired={false}
          name="company"
          label="Компания / ИНН"
          disabled={isPending}
          error={state.fieldErrors?.company}
          defaultValue={state.payload?.company as string}
        />
      </div>

      <FloatingField
        name="message"
        label="Опишите ваши задачи"
        isTextarea
        disabled={isPending}
        error={state.fieldErrors?.message}
        defaultValue={state.payload?.message as string}
      />

      <span className="text-muted-foreground/80 text-sm">
        * – обязательные поля
      </span>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className={cn("flex items-start gap-3", "md:items-center")}>
            <Checkbox
              id="consent"
              name="consent"
              value="on"
              disabled={isPending}
              defaultChecked={state.payload?.consent === "on"}
              className="mt-1 shrink-0"
            />
            <label
              htmlFor="consent"
              className="text-foreground/80 cursor-pointer text-sm"
            >
              Я даю согласие на{" "}
              <a
                href="/policies/consent"
                target="_blank"
                className="text-brand-secondary-muted hover:text-brand-secondary transition-colors"
              >
                обработку персональных данных
              </a>{" "}
              и соглашаюсь с{" "}
              <a
                href="/policies/privacy"
                target="_blank"
                className="text-brand-secondary-muted hover:text-brand-secondary transition-colors"
              >
                политикой конфиденциальности
              </a>
              .
            </label>
          </div>
          {state.fieldErrors?.consent && (
            <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{state.fieldErrors.consent}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-secondary text-foreground hover:bg-brand-secondary/80 h-12 w-full rounded-xl text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Отправка..." : "Оставить заявку"}
        </Button>
      </div>
    </form>
  );
};
