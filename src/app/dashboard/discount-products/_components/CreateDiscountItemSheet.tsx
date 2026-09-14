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
import { Plus } from "lucide-react";
import { createDiscountItemAction } from "@/src/server/actions/admin-discount";
import { DiscountItemForm } from "./DiscountItemForm";

export const CreateDiscountItemSheet = ({
  categories,
}: {
  categories: { id: string; name: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get("productId");

    if (!productId) {
      toast.error("Выберите базовую модель");
      return;
    }

    startTransition(async () => {
      const result = await createDiscountItemAction(formData);
      if (result.success) {
        toast.success("Уцененный товар добавлен!");
        setIsOpen(false);
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

        {isOpen && (
          <DiscountItemForm
            mode="create"
            categories={categories}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
