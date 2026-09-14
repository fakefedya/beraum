"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
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
import {
  Loader2,
  Plus,
  AlertCircle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { createDiscountItemAction } from "@/src/server/actions/admin-discount";
import { DiscountMediaUploader } from "./DiscountMediaUploader";
import { cn } from "@/src/lib/utils";

export type ProductModelDTO = {
  id: string;
  itemArticle: string;
};

export const CreateDiscountItemSheet = ({
  categories,
}: {
  categories: { id: string; name: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [models, setModels] = useState<ProductModelDTO[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Стейт для Combobox
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const abortController = new AbortController();

    fetch(`/api/products/models?categoryId=${selectedCategoryId}`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setModels(data.data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          toast.error("Ошибка загрузки моделей");
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingModels(false);
        }
      });

    return () => abortController.abort();
  }, [selectedCategoryId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModelId) {
      toast.error("Выберите базовую модель");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDiscountItemAction(formData);
      if (result.success) {
        toast.success("Уцененный товар добавлен!");
        setIsOpen(false);
        formRef.current?.reset();
        setSelectedCategoryId("");
        setSelectedModelId("");
        setModels([]);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-foreground text-background hover:bg-foreground/80 h-10 px-4 font-medium">
          <Plus className="mr-2 size-4" /> Добавить уценку
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-auto w-full flex-col gap-0 border-none p-0 sm:max-w-md md:inset-y-4 md:right-4 md:rounded-4xl"
      >
        <SheetHeader className="px-6 pt-6 text-left">
          <SheetTitle className="text-xl">Новый экземпляр дисконта</SheetTitle>
        </SheetHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="h-[calc(100%-68px)]"
        >
          {/* Скрытый инпут для передачи ID в FormData */}
          <input type="hidden" name="productId" value={selectedModelId} />

          <div className="flex h-full max-h-[calc(100%-112px)] flex-1 flex-col gap-6 overflow-y-auto p-6">
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>
                Создается физический экземпляр. SKU должен быть абсолютно
                уникальным (например: HI-3C004MW-D001).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Категория (фильтр)
              </label>
              <Select
                value={selectedCategoryId}
                onValueChange={(val) => {
                  setSelectedCategoryId(val);
                  setSelectedModelId(""); // 🛡️ Сброс модели при смене категории
                  setIsLoadingModels(true);
                }}
                disabled={isPending}
              >
                <SelectTrigger className="bg-background w-full">
                  <SelectValue placeholder="Выберите категорию для поиска" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Базовая модель <span className="text-red-500">*</span>
              </label>
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    disabled={
                      isPending || !selectedCategoryId || isLoadingModels
                    }
                    className={cn(
                      "bg-background border-input w-full justify-between px-3 py-2 font-normal shadow-none hover:bg-transparent",
                      !selectedModelId && "text-muted-foreground",
                    )}
                  >
                    {isLoadingModels ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
                      </span>
                    ) : selectedModelId ? (
                      models.find((m) => m.id === selectedModelId)
                        ?.itemArticle || "Выбрано"
                    ) : selectedCategoryId ? (
                      "Поиск по артикулу..."
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
                          ? "Нет моделей"
                          : "Модель не найдена"}
                      </CommandEmpty>
                      <CommandGroup>
                        {models.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.itemArticle}
                            onSelect={() => {
                              setSelectedModelId(m.id);
                              setIsComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedModelId === m.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="text-foreground font-medium">
                              {m.itemArticle}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Уникальный SKU <span className="text-red-500">*</span>
              </label>
              <Input
                name="uniqueSku"
                required
                disabled={isPending}
                placeholder="HI-3C004MW-D001"
                className="bg-background font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Цена со скидкой (₽) <span className="text-red-500">*</span>
              </label>
              <Input
                name="discountPrice"
                type="number"
                required
                disabled={isPending}
                placeholder="15000"
                className="bg-background"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Описание дефекта <span className="text-red-500">*</span>
              </label>
              <textarea
                name="defectDescription"
                required
                disabled={isPending}
                placeholder="Царапина на стекле 2см, отсутствует коробка..."
                className="bg-background border-input focus-visible:ring-ring min-h-24 resize-none rounded-md border p-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>

            <div className="border-t pt-4">
              <DiscountMediaUploader />
            </div>
          </div>
          <div className="bg-background mt-auto rounded-4xl p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <Button type="submit" disabled={isPending} className="h-12 w-full">
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending ? "Сохранение..." : "Добавить в каталог"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
