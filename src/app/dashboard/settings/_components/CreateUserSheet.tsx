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
        <Button className="bg-foreground text-background font-medium">
          <Plus className="mr-2 size-4" /> Добавить сотрудника
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Новый сотрудник</SheetTitle>
        </SheetHeader>

        <form action={handleAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Имя *</label>
            <Input name="name" required disabled={isPending} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email *</label>
            <Input name="email" type="email" required disabled={isPending} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Роль *</label>
            <Select name="role" defaultValue="manager" disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Пароль *</label>
            <Input
              name="password"
              type="text"
              required
              minLength={8}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">2FA</label>
            <Select
              name="isTwoFactorEnabled"
              defaultValue="true"
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Включить (Email)</SelectItem>
                <SelectItem value="false">Выключить</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 h-12 w-full"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Создать учетную запись
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
