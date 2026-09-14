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
import { Edit2 } from "lucide-react";
import { updateDiscountItemAction } from "@/src/server/actions/admin-discount";
import { DiscountItemForm } from "./DiscountItemForm";
import type { DiscountItemDTO } from "./DiscountItemsTable";

export const EditDiscountItemSheet = ({ item }: { item: DiscountItemDTO }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

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
            Базовая модель: {item.baseArticle}
          </span>
        </SheetHeader>

        {isOpen && (
          <DiscountItemForm
            mode="edit"
            initialData={item}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
