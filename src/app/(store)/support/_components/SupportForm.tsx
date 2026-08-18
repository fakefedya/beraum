"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { submitSupportAction } from "@/src/server/actions/feedback.actions";
import { getSupportModelsByCategory } from "@/src/server/actions/products.queries";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { MediaUploader } from "./MediaUploader";
import { toast } from "sonner";
import { MARKETPLACE_LINKS } from "@/src/lib/constants";

interface SupportFormProps {
  categories: { id: string; name: string }[];
}

export const SupportForm = ({ categories }: SupportFormProps) => {
  const [state, formAction, isPending] = useActionState(submitSupportAction, {
    success: false,
  });

  const initialCategoryId = (state.payload?.categoryId as string) || null;
  const initialModelArticle = (state.payload?.modelArticle as string) || "";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId,
  );
  const [models, setModels] = useState<
    { itemArticle: string; siteArticle: string }[]
  >([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(
    Boolean(initialCategoryId),
  );

  const [selectedModel, setSelectedModel] =
    useState<string>(initialModelArticle);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const latestCategoryReq = useRef<string | null>(initialCategoryId);

  useEffect(() => {
    let isCancelled = false;
    const payloadCatId = state.payload?.categoryId as string | undefined;

    if (payloadCatId) {
      getSupportModelsByCategory(payloadCatId).then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setModels(res.data);
          }
          setIsLoadingModels(false);
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [state.payload?.categoryId]);

  // Обработчик интерактивного выбора категории пользователем
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedModel(""); // Сброс выбранной модели при смене категории
    setModels([]);
    setIsLoadingModels(true);
    latestCategoryReq.current = categoryId;

    try {
      const res = await getSupportModelsByCategory(categoryId);
      if (latestCategoryReq.current === categoryId && res.success) {
        setModels(res.data);
      }
    } finally {
      if (latestCategoryReq.current === categoryId) {
        setIsLoadingModels(false);
      }
    }
  };

  if (state.success) {
    return (
      <div
        className={cn(
          "bg-card/50 flex flex-col items-center justify-center rounded-[24px] p-12 text-center",
          "animate-in fade-in zoom-in-95 duration-500",
        )}
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-3 text-3xl font-medium">Обращение создано</h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          Специалист технической поддержки свяжется с вами.
        </p>
        <Button
          variant="outline"
          className="mt-8 h-12 rounded-xl px-8"
          onClick={() => window.location.reload()}
        >
          Создать новое обращение
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-3xl flex-col gap-16 text-left"
      noValidate

      onSubmit={(e) => {
        const uploader = e.currentTarget.querySelector(
          '[data-uploading="true"]',
        );
        if (uploader) {
          e.preventDefault();
          toast.warning("Файлы загружаются", {
            description:
              "Пожалуйста, дождитесь окончания загрузки всех медиафайлов перед отправкой формы.",
          });
        }
      }}
    >
      {state.error && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600",
            "animate-in fade-in",
          )}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}
      {/* С чем вам требуется помощь? */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          С чем вам требуется помощь?
          <span className="ml-1 text-red-600/60">*</span>
        </h3>
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            "sm:grid-cols-2 md:grid-cols-3",
          )}
        >
          {categories.map((cat) => (
            <label key={cat.id} className="group cursor-pointer">
              <input
                type="radio"
                name="categoryId"
                value={cat.id}
                defaultChecked={initialCategoryId === cat.id}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="peer sr-only"
                disabled={isPending}
              />
              <div
                className={cn(
                  "border-ring/30 flex aspect-video flex-col justify-between rounded-2xl border p-4",
                  "hover:border-muted-foreground transition-all duration-200",
                  "peer-checked:border-brand-secondary peer-checked:hover:border-brand-secondary peer-focus-visible:ring-brand-secondary peer-checked:ring-brand-secondary peer-checked:bg-transparent peer-checked:ring-1 peer-focus-visible:ring-2",
                  "md:aspect-square",
                  state.fieldErrors?.categoryId &&
                    "border-red-500 bg-[#fff2f4] hover:border-red-300",
                )}
              >
                <span className="text-muted-foreground text-sm">Категория</span>
                <span className="text-base font-medium">{cat.name}</span>
              </div>
            </label>
          ))}
        </div>
        {state.fieldErrors?.categoryId && (
          <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{state.fieldErrors.categoryId}</span>
          </div>
        )}
      </div>
      {/* Какая модель устройства? */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          Какая модель устройства?
          <span className="ml-1 text-red-600/60">*</span>
        </h3>
        <div className="flex">
          <div className="flex w-full flex-col gap-4">
            <input type="hidden" name="modelArticle" value={selectedModel} />

            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  disabled={isPending || !selectedCategoryId || isLoadingModels}
                  className={cn(
                    "h-14 w-full justify-between rounded-xl px-4 text-base font-normal hover:bg-transparent",
                    !selectedModel && "text-muted-foreground",
                    state.fieldErrors?.modelArticle &&
                      "border-red-500 bg-[#fff2f4]",
                  )}
                >
                  {isLoadingModels ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Загрузка
                      моделей...
                    </span>
                  ) : selectedModel ? (
                    models.find((m) => m.itemArticle === selectedModel)
                      ?.siteArticle || selectedModel
                  ) : selectedCategoryId ? (
                    "Выберите модель..."
                  ) : (
                    "Сначала выберите категорию"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full min-w-(--radix-popover-trigger-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Поиск по артикулу..." />
                  <CommandList>
                    <CommandEmpty>
                      {models.length === 0
                        ? "В этой категории нет зарегистрированных моделей"
                        : "Модель не найдена"}
                    </CommandEmpty>
                    <CommandGroup>
                      {models.map((m) => (
                        <CommandItem
                          key={m.itemArticle}
                          value={`${m.siteArticle} ${m.itemArticle}`}
                          onSelect={() => {
                            setSelectedModel(m.itemArticle);
                            setIsComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedModel === m.itemArticle
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="text-foreground font-medium">
                            {m.itemArticle}
                          </span>
                          <span className="text-muted-foreground ml-auto text-xs">
                            {m.siteArticle}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {state.fieldErrors?.modelArticle && (
              <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{state.fieldErrors.modelArticle}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Где вы приобрели устройство? */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          Где вы приобрели устройство?
          <span className="ml-1 text-red-600/60">*</span>
        </h3>
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            "sm:grid-cols-2 md:grid-cols-3",
          )}
        >
          {MARKETPLACE_LINKS.store.map((mp) => {
            const Icon = mp.icon;
            return (
              <label key={mp.id} className="group cursor-pointer">
                <input
                  type="radio"
                  name="marketplace"
                  value={mp.id}
                  defaultChecked={state.payload?.marketplace === mp.id}
                  className="peer sr-only"
                  disabled={isPending}
                />
                <div
                  className={cn(
                    "border-ring/30 flex aspect-video flex-col justify-between rounded-2xl border p-4",
                    "hover:border-muted-foreground transition-all duration-200",
                    "peer-checked:border-brand-secondary peer-checked:hover:border-brand-secondary peer-focus-visible:ring-brand-secondary peer-checked:ring-brand-secondary peer-checked:bg-transparent peer-checked:ring-1 peer-focus-visible:ring-2",
                    "md:aspect-square",
                    state.fieldErrors?.marketplace &&
                      "border-red-500 bg-[#fff2f4] hover:border-red-300",
                  )}
                >
                  <span className="text-muted-foreground text-sm">
                    {mp.type}
                  </span>
                  <div className="flex flex-col gap-2">
                    <Icon className="size-12" />
                    <span className="text-base font-medium">{mp.label}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        {state.fieldErrors?.marketplace && (
          <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{state.fieldErrors.marketplace}</span>
          </div>
        )}
      </div>
      {/* Когда вы приобрели устройство? */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          Когда вы приобрели устройство?
        </h3>
        <div className="flex w-full gap-4">
          <FloatingField
            name="purchaseDate"
            label="Дата покупки"
            type="date"
            disabled={isPending}
            defaultValue={state.payload?.purchaseDate as string}
            error={state.fieldErrors?.purchaseDate}
          />
        </div>
      </div>
      {/* Краткое описание неисправности */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          Краткое описание неисправности
        </h3>
        <FloatingField
          name="message"
          label="Описание неисправности"
          isTextarea
          disabled={isPending}
          defaultValue={state.payload?.message as string}
          error={state.fieldErrors?.message}
        />

        <MediaUploader />
      </div>
      {/* Персональная информация */}
      <div className="flex flex-col gap-4">
        <h3 className="text-center text-2xl font-medium">
          Персональная информация
        </h3>
        <div className="bg-card text-foreground flex items-center gap-3 rounded-2xl p-4">
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
            defaultValue={state.payload?.name as string}
            error={state.fieldErrors?.name}
          />
          <FloatingField
            name="address"
            label="Адрес"
            disabled={isPending}
            defaultValue={state.payload?.address as string}
            error={state.fieldErrors?.address}
          />
          <FloatingField
            name="phone"
            label="Номер телефона"
            type="tel"
            disabled={isPending}
            defaultValue={state.payload?.phone as string}
            error={state.fieldErrors?.phone}
          />
          <FloatingField
            name="email"
            label="Почта"
            type="email"
            disabled={isPending}
            defaultValue={state.payload?.email as string}
            error={state.fieldErrors?.email}
          />
        </div>
        <span className="text-muted-foreground/80 text-sm">
          * – обязательные поля
        </span>
      </div>
      <div className="flex flex-col items-center gap-4">
        {" "}
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-secondary text-foreground hover:bg-brand-secondary/90 mt-2 h-14 w-full rounded-xl text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Создание обращения..." : "Создать обращение"}
        </Button>
        <p
          className={cn(
            "text-muted-foreground/80 max-w-full text-center text-xs",
            "md:max-w-[75%]",
          )}
        >
          Нажимая кнопку «Создать обращение», вы подтверждаете своё согласие на{" "}
          <a
            href="/policies/privacy"
            className="text-foreground/80 underline underline-offset-4 hover:no-underline"
          >
            обработку персональных данных
          </a>
          .
        </p>
      </div>
    </form>
  );
};
