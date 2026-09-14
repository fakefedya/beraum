"use client";

import { useState, useTransition, useRef } from "react";
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
import { Loader2, Edit2 } from "lucide-react";
import { updateDiscountItemAction } from "@/src/server/actions/admin-discount";
import { DiscountMediaUploader } from "./DiscountMediaUploader";
import type { DiscountItemDTO } from "./DiscountItemsTable"; // 🛡️ Импортируем тип

export const EditDiscountItemSheet = ({ item }: { item: DiscountItemDTO }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(item.status);

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", item.id);
    formData.append("status", status);

    startTransition(async () => {
      const result = await updateDiscountItemAction(formData);
      if (result.success) {
        toast.success("Изменения сохранены!");
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-background/60 w-full border-none shadow-none"
        >
          <Edit2 className="mr-2 size-4" />
          <span className="text-sm">Изменить</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-auto w-full flex-col gap-0 border-none p-0 sm:max-w-md md:inset-y-4 md:right-4 md:rounded-4xl"
      >
        <SheetHeader className="px-6 pt-6 text-left">
          <SheetTitle className="text-xl">
            Редактирование {item.uniqueSku}
          </SheetTitle>
          <span className="text-muted-foreground text-sm">
            База: {item.baseArticle}
          </span>
        </SheetHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="h-[calc(100%-68px)]"
        >
          <div className="flex h-full max-h-[calc(100%-112px)] flex-1 flex-col gap-6 overflow-y-auto p-6">
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

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Цена со скидкой (₽) <span className="text-red-500">*</span>
              </label>
              <Input
                name="discountPrice"
                type="number"
                required
                disabled={isPending}
                defaultValue={item.discountPrice}
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
                defaultValue={item.defectDescription}
                className="bg-background border-input focus-visible:ring-ring min-h-24 resize-none rounded-md border p-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>

            <div className="border-t pt-4">
              <DiscountMediaUploader initialMedia={item.mediaKeys} />
            </div>
          </div>

          <div className="bg-background mt-auto rounded-4xl p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <Button type="submit" disabled={isPending} className="h-12 w-full">
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
