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
// import { Textarea } from "@/src/components/ui/textarea";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { createDiscountItemAction } from "@/src/server/actions/admin-discount";
import { MediaUploader } from "@/src/app/(store)/support/_components/MediaUploader";

export const CreateDiscountItemSheet = ({
  categories,
}: {
  categories: { id: string; name: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [models, setModels] = useState<any[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Динамическая загрузка моделей при смене категории
  useEffect(() => {
    if (!selectedCategoryId) return;
    // setIsLoadingModels(true);
    fetch(`/api/products/models?categoryId=${selectedCategoryId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setModels(data.data);
      })
      .catch(() => toast.error("Ошибка загрузки моделей"))
      .finally(() => setIsLoadingModels(false));
  }, [selectedCategoryId]);

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await createDiscountItemAction(formData);
      if (result.success) {
        toast.success("Уцененный товар добавлен!");
        setIsOpen(false);
        formRef.current?.reset();
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
          action={handleAction}
          className="h-[calc(100%-68px)]"
        >
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
                onValueChange={setSelectedCategoryId}
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
              <Select
                name="productId"
                disabled={isPending || isLoadingModels || !selectedCategoryId}
              >
                <SelectTrigger className="bg-background w-full">
                  <SelectValue
                    placeholder={
                      isLoadingModels
                        ? "Загрузка..."
                        : "Выберите базовую модель"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.itemArticle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="bg-background min-h-24 resize-none"
              />
            </div>

            {/* Переиспользуем готовый компонент загрузки из службы поддержки */}
            <div className="border-t pt-4">
              <MediaUploader />
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
