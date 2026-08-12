"use client";

import { useState, useTransition, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { supportSchema } from "@/src/lib/validations/feedback";
import { submitSupportAction } from "@/src/server/actions/feedback.actions";
import { getModelsByCategory } from "@/src/server/actions/products.queries";
import { z } from "zod";

const MARKETPLACES = [
  { id: "ozon", name: "Ozon" },
  { id: "wb", name: "Wildberries" },
  { id: "ymarket", name: "Яндекс Маркет" },
  { id: "megamarket", name: "МегаМаркет" },
  { id: "beraum", name: "Официальный сайт Beraum" },
];

interface SupportFormProps {
  categories: { id: string; name: string }[];
}

export const SupportForm = ({ categories }: SupportFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [models, setModels] = useState<
    { itemArticle: string; siteArticle: string }[]
  >([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const latestCategoryReq = useRef<string | null>(null);

  const extractErrors = (zodError: z.ZodError) => {
    const fieldErrors: Record<string, string> = {};
    zodError.issues.forEach((issue) => {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    });
    return fieldErrors;
  };

  const triggerValidation = (formElement: HTMLFormElement) => {
    if (!hasSubmitted) return;
    const data = Object.fromEntries(new FormData(formElement));
    const parsed = supportSchema.safeParse(data);
    setErrors(parsed.success ? {} : extractErrors(parsed.error));
  };

  const processForm = (formData: FormData) => {
    setHasSubmitted(true);
    setErrors({});
    setServerError(null);

    const data = Object.fromEntries(formData.entries());
    const parsed = supportSchema.safeParse(data);

    if (!parsed.success) {
      setErrors(extractErrors(parsed.error));
      return;
    }

    startTransition(async () => {
      const result = await submitSupportAction(data);
      if (result.success) {
        setSuccess(true);
        setHasSubmitted(false);
        if (formRef.current) formRef.current.reset();
        setSelectedCategoryId(null);
        setModels([]);
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
          Обращение создано
        </h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          Специалист технической поддержки свяжется с вами.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        processForm(new FormData(e.currentTarget));
      }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-10 text-left"
      noValidate
    >
      {serverError && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      {/* ШАГ 1: Категория */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">
          С чем вам требуется помощь?
          <span className="ml-1 text-red-600/60">*</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <label key={cat.id} className="group cursor-pointer">
              <input
                type="radio"
                name="categoryId"
                value={cat.id}
                onChange={(e) => {
                  const newCategoryId = e.target.value;
                  setSelectedCategoryId(newCategoryId);
                  setModels([]);
                  setIsLoadingModels(true);
                  if (e.target.form) triggerValidation(e.target.form);

                  latestCategoryReq.current = newCategoryId;
                  getModelsByCategory(newCategoryId)
                    .then((res) => {
                      if (
                        latestCategoryReq.current === newCategoryId &&
                        res.success
                      ) {
                        setModels(res.data);
                      }
                    })
                    .finally(() => {
                      if (latestCategoryReq.current === newCategoryId) {
                        setIsLoadingModels(false);
                      }
                    });
                }}
                className="peer sr-only"
                disabled={isPending}
              />
              <div
                className={cn(
                  "bg-card flex items-center gap-3 rounded-2xl border-2 border-transparent p-4 transition-all hover:border-black/10",
                  "peer-checked:border-brand-secondary peer-focus-visible:ring-brand-secondary peer-focus-visible:ring-2",
                  errors.categoryId && "border-red-500/50 bg-[#fff2f4]",
                )}
              >
                <div className="bg-accent h-10 w-10 shrink-0 rounded-full" />
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.categoryId && (
          <div className="flex items-center gap-1.5 px-1 text-sm font-medium text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.categoryId}</span>
          </div>
        )}
      </div>

      {/* ШАГ 2: Место покупки */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">
          Где вы приобрели устройство?
          <span className="ml-1 text-red-600/60">*</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {MARKETPLACES.map((mp) => (
            <label key={mp.id} className="group cursor-pointer">
              <input
                type="radio"
                name="marketplace"
                value={mp.id}
                onChange={(e) => triggerValidation(e.target.form!)}
                className="peer sr-only"
                disabled={isPending}
              />
              <div
                className={cn(
                  "bg-card flex items-center gap-3 rounded-2xl border-2 border-transparent p-4 transition-all hover:border-black/10",
                  "peer-checked:border-brand-secondary peer-focus-visible:ring-brand-secondary peer-focus-visible:ring-2",
                  errors.marketplace && "border-red-500/50 bg-[#fff2f4]",
                )}
              >
                <span className="text-sm font-medium">{mp.name}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.marketplace && (
          <div className="flex items-center gap-1.5 px-1 text-sm font-medium text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.marketplace}</span>
          </div>
        )}
      </div>

      {/* ШАГ 3: Дата и Модель */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">
          Когда вы приобрели устройство и какая модель?
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingField
            name="purchaseDate"
            label="Дата покупки (ДД.ММ.ГГГГ)"
            type="text"
            disabled={isPending}
            error={errors.purchaseDate}
            onChange={(e) => triggerValidation(e.target.form!)}
          />
          <div className="relative">
            <FloatingField
              name="modelArticle"
              list="models-list"
              label={
                selectedCategoryId
                  ? isLoadingModels
                    ? "Загрузка моделей..."
                    : "Начните вводить артикул"
                  : "Сначала выберите категорию"
              }
              disabled={isPending || !selectedCategoryId || isLoadingModels}
              error={errors.modelArticle}
              onChange={(e) => triggerValidation(e.target.form!)}
            />
            {isLoadingModels && (
              <Loader2 className="text-muted-foreground absolute top-5 right-4 h-5 w-5 animate-spin" />
            )}
            <datalist id="models-list">
              {models.map((m) => (
                <option key={m.itemArticle} value={m.itemArticle}>
                  {m.siteArticle}
                </option>
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* ШАГ 4: Описание неисправности */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Краткое описание неисправности</h3>
        <FloatingField
          name="message"
          label="Описание неисправности"
          isTextarea
          disabled={isPending}
          error={errors.message}
          onChange={(e) => triggerValidation(e.target.form!)}
        />
        <div className="bg-card/50 hover:bg-card flex flex-col gap-2 rounded-2xl border border-dashed border-black/20 p-8 text-center transition-colors">
          <UploadCloud className="text-muted-foreground mx-auto h-8 w-8" />
          <p className="text-sm font-medium">
            Загрузить фото или видео неисправности
          </p>
          <p className="text-muted-foreground text-xs">
            До 5 файлов (JPG, PNG, MP4, PDF). Макс. 50 МБ на файл.
          </p>
        </div>
      </div>

      {/* ШАГ 5: Персональная информация */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Персональная информация</h3>
        <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-blue-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Пожалуйста, укажите корректные данные: свяжемся с вами по Telegram,
            привязанному к номеру телефона, либо напишем на почту.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingField
            name="name"
            label="ФИО"
            disabled={isPending}
            error={errors.name}
            onChange={(e) => triggerValidation(e.target.form!)}
          />
          <FloatingField
            name="address"
            label="Адрес"
            disabled={isPending}
            error={errors.address}
            onChange={(e) => triggerValidation(e.target.form!)}
          />
          <FloatingField
            name="phone"
            label="Номер телефона"
            type="tel"
            disabled={isPending}
            error={errors.phone}
            onChange={(e) => triggerValidation(e.target.form!)}
          />
          <FloatingField
            name="email"
            label="Почта"
            type="email"
            disabled={isPending}
            error={errors.email}
            onChange={(e) => triggerValidation(e.target.form!)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-brand-secondary text-foreground hover:bg-brand-secondary/90 mt-4 h-14 w-full rounded-xl text-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Создание обращения..." : "Создать обращение"}
      </Button>
    </form>
  );
};
