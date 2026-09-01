"use client";

import { useActionState } from "react";
import { submitWholesaleAction } from "@/src/server/actions/discount";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export const WholesaleForm = () => {
  const [state, formAction, isPending] = useActionState(submitWholesaleAction, {
    success: false,
  });

  if (state.success) {
    return (
      <div className="bg-card/50 animate-in fade-in zoom-in-95 flex flex-col items-center justify-center rounded-[32px] border border-black/5 p-12 text-center shadow-sm duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-foreground mb-3 text-3xl font-medium">
          Заявка отправлена
        </h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          Мы подготовим актуальный прайс-лист и свяжемся с вами в ближайшее
          время.
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
      action={formAction}
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      noValidate
    >
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <h3 className="text-foreground text-3xl font-medium">
          Получить прайс-лист и наличие
        </h3>
        <p className="text-muted-foreground text-lg">
          Заполните форму, чтобы получить актуальные цены и условия для
          оптовиков.
        </p>
      </div>

      {state.error && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
        <FloatingField
          name="email"
          label="Почта"
          type="email"
          disabled={isPending}
          error={state.fieldErrors?.email}
          defaultValue={state.payload?.email as string}
        />
        <FloatingField
          name="city"
          label="Город"
          disabled={isPending}
          error={state.fieldErrors?.city}
          defaultValue={state.payload?.city as string}
        />
      </div>

      <div className="relative flex w-full flex-col gap-1.5">
        <div className="relative w-full">
          <Select
            name="techType"
            defaultValue={(state.payload?.techType as string) || "both"}
            disabled={isPending}
          >
            <SelectTrigger
              className={cn(
                "text-foreground h-14 w-full rounded-xl border bg-transparent px-4 pt-6 pb-2 text-base transition-all duration-200 outline-none",
                "border-ring/30 focus:border-brand-secondary focus:ring-brand-secondary focus:ring-1",
                state.fieldErrors?.techType &&
                  "border-red-500 bg-[#fff2f4] focus:border-red-500 focus:ring-red-500",
              )}
            >
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="both" className="cursor-pointer rounded-lg">
                Обе категории
              </SelectItem>
              <SelectItem value="working" className="cursor-pointer rounded-lg">
                Исправная уценка (Спб)
              </SelectItem>
              <SelectItem value="broken" className="cursor-pointer rounded-lg">
                Неисправная техника (Мск / Спб)
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Статичный Floating Label (эмитируем активное состояние) */}
          <label className="text-muted-foreground pointer-events-none absolute top-4 left-4 z-10 flex origin-[0] -translate-y-2.5 scale-[0.8] gap-0.5 transition-all duration-200">
            Интересующая категория <span className="text-red-600/60">*</span>
          </label>
        </div>

        {/* Вывод ошибки в едином стиле */}
        <div
          className={cn(
            "flex items-start gap-1.5 px-1 text-xs font-medium text-red-500 opacity-0 transition-opacity duration-300",
            state.fieldErrors?.techType && "opacity-100",
          )}
        >
          {state.fieldErrors?.techType && (
            <>
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{state.fieldErrors.techType}</span>
            </>
          )}
        </div>
      </div>

      <FloatingField
        name="message"
        label="Комментарий или вопросы (опционально)"
        isTextarea
        disabled={isPending}
        error={state.fieldErrors?.message}
        isRequired={false}
        defaultValue={state.payload?.message as string}
      />

      <div className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="wholesale-consent"
              name="consent"
              value="on"
              disabled={isPending}
              defaultChecked={state.payload?.consent === "on"}
              className="shrink-0"
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
          {isPending ? "Отправка..." : "Получить прайс-лист"}
        </Button>
      </div>
    </form>
  );
};
