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
import { Loader2, Plus } from "lucide-react";
import { createUserAction } from "@/src/server/actions/admin-users";
import { cn } from "@/src/lib/utils";

export const CreateUserSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        toast.success("Пользователь успешно создан");
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-foreground text-background h-10 px-4 font-medium">
          <Plus className="mr-2 size-4" /> Добавить пользователя
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className={cn(
          "flex h-auto w-full flex-col gap-0 border-none p-0",
          "sm:max-w-md",
          "md:inset-y-4 md:right-4 md:rounded-4xl",
        )}
      >
        <SheetHeader className="px-6 pt-6 text-left">
          <SheetTitle className="text-xl">Создание пользователя</SheetTitle>
        </SheetHeader>

        <form action={handleAction} className="h-[calc(100%-68px)]">
          <div className="flex h-full max-h-[calc(100%-112px)] flex-1 flex-col gap-8 overflow-y-auto p-6">
            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Имя <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                required
                disabled={isPending}
                className="shadow-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Почта <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                required
                disabled={isPending}
                className="shadow-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Роль <span className="text-red-500">*</span>
              </label>
              <Select name="role" defaultValue="manager" disabled={isPending}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Администратор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="support">Поддержка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Пароль <span className="text-red-500">*</span>
              </label>
              <Input
                name="password"
                type="text"
                required
                minLength={8}
                disabled={isPending}
                className="shadow-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">2FA</label>
              <Select
                name="isTwoFactorEnabled"
                defaultValue="true"
                disabled={isPending}
              >
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Включить (Код на почту)</SelectItem>
                  <SelectItem value="false">Выключить</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-background mt-auto rounded-4xl p-6">
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 h-12 w-full"
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Создать учетную запись
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
