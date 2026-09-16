"use client";

import { useState, useEffect } from "react";
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
import { Loader2, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { DiscountMediaUploader } from "./DiscountMediaUploader";
import { getModelsByCategoryAction } from "@/src/server/actions/admin-discount";
import type { DiscountItemDTO } from "./DiscountItemsTable";

export type ProductModelDTO = {
  id: string;
  itemArticle: string;
};

interface DiscountItemFormProps {
  mode: "create" | "edit";
  initialData?: DiscountItemDTO;
  categories?: { id: string; name: string }[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

export const DiscountItemForm = ({
  mode,
  initialData,
  categories = [],
  onSubmit,
  isPending,
}: DiscountItemFormProps) => {
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [models, setModels] = useState<ProductModelDTO[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [status, setStatus] = useState<string>(
    initialData?.status || "available",
  );

  useEffect(() => {
    if (mode === "edit" || !selectedCategoryId) return;

    let isMounted = true;

    getModelsByCategoryAction(selectedCategoryId)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setModels(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingModels(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, mode]);

  return (
    <form onSubmit={onSubmit} className="h-[calc(100%-68px)]">
      {mode === "create" && (
        <input type="hidden" name="productId" value={selectedModelId} />
      )}
      {mode === "edit" && initialData && (
        <>
          <input type="hidden" name="id" value={initialData.id} />
          <input type="hidden" name="status" value={status} />
        </>
      )}

      <div className="flex max-h-[calc(100%-112px)] flex-1 flex-col gap-8 overflow-y-auto p-6">
        {mode === "create" && (
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>
              Создается физический экземпляр. SKU должен быть абсолютно
              уникальным (например: HI-3C004MW-D001).
            </p>
          </div>
        )}

        {mode === "create" && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Категория (фильтр)
              </label>
              <Select
                value={selectedCategoryId}
                onValueChange={(val) => {
                  setSelectedCategoryId(val);
                  setSelectedModelId("");
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
          </>
        )}

        {mode === "edit" && (
          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">
              Статус
            </label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isPending}
            >
              <SelectTrigger className="bg-background w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Доступен</SelectItem>
                <SelectItem value="reserved">Бронь</SelectItem>
                <SelectItem value="sold">Продан</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm font-medium">
            Цена со скидкой (₽) <span className="text-red-500">*</span>
          </label>
          <Input
            name="discountPrice"
            type="number"
            required
            disabled={isPending}
            defaultValue={initialData?.discountPrice}
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
            defaultValue={initialData?.defectDescription}
            placeholder="Царапина на стекле 2см, отсутствует коробка, а в Beraum присутствует кризис..."
            className="bg-background border-input focus-visible:ring-ring min-h-24 resize-none rounded-md border p-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
          />
        </div>

        <div>
          <DiscountMediaUploader
            initialMedia={initialData?.mediaKeys}
            onUploadingChange={setIsMediaUploading}
          />
        </div>
      </div>

      <div className="bg-background mt-auto rounded-4xl p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <Button
          type="submit"
          disabled={isPending || isMediaUploading}
          className="h-12 w-full"
        >
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isPending
            ? "Сохранение..."
            : mode === "create"
              ? "Добавить в каталог"
              : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  );
};
