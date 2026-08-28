"use client";

import { useState, useTransition } from "react";
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
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { createProductAction } from "@/src/server/actions/admin-products";

interface Category {
  id: string;
  name: string;
}

export const CreateProductSheet = ({
  categories,
}: {
  categories: Category[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result.success) {
        toast.success("Товар успешно создан!");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Ошибка создания");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-foreground text-background hover:bg-foreground/80 font-medium">
          <Plus className="mr-2 size-4" /> Добавить товар
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Создание нового товара</SheetTitle>
        </SheetHeader>

        <form action={handleAction} className="flex flex-col gap-6">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>
              Заполните базовые данные для создания карточки. После сохранения
              товар появится в таблице со статусом <b>Черновик</b>, где вы
              сможете загрузить фото, документы и заполнить JSON-характеристики.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Категория <span className="text-red-500">*</span>
            </label>
            <Select name="categoryId" required disabled={isPending}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Выберите категорию" />
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
            <label className="text-sm font-medium">
              Модель (site_article) <span className="text-red-500">*</span>
            </label>
            <Input
              name="siteArticle"
              required
              disabled={isPending}
              placeholder="Например: HI-3C004"
              className="bg-background"
            />
            <span className="text-muted-foreground text-xs">
              Связывает разные цвета в одну карточку на сайте.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Уникальный SKU (item_article){" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="itemArticle"
              required
              disabled={isPending}
              placeholder="Например: HI-3C004MW"
              className="bg-background font-mono"
            />
            <span className="text-muted-foreground text-xs">
              Точный артикул конкретной модели и цвета.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Цвет товара</label>
            <Input
              name="colorName"
              disabled={isPending}
              placeholder="Например: Матовый белый"
              className="bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 h-12 w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {isPending ? "Сохранение..." : "Создать каркас товара"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
