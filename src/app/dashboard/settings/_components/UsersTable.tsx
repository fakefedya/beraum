"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Save, ShieldAlert, ShieldCheck } from "lucide-react";
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
  updateUserAction,
  deleteUserAction,
} from "@/src/server/actions/admin-users";

export type SafeUserItem = {
  id: string;
  name: string | null;
  email: string;
  role: "superadmin" | "manager" | "support";
  isLocked: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
};

export const UsersTable = ({
  initialData,
  currentUserId,
}: {
  initialData: SafeUserItem[];
  currentUserId: string;
}) => {
  if (!initialData.length)
    return (
      <div className="p-8 text-center text-sm">Пользователи не найдены.</div>
    );

  return (
    <table className="w-full text-left text-sm">
      <thead className="text-muted-foreground border-b text-xs uppercase">
        <tr>
          <th className="px-4 py-3 font-medium">Пользователь</th>
          <th className="px-4 py-3 font-medium">Роль</th>
          <th className="px-4 py-3 font-medium">Безопасность</th>
          <th className="px-4 py-3 font-medium">Новый пароль</th>
          <th className="px-4 py-3 font-medium">Действия</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {initialData.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
          />
        ))}
      </tbody>
    </table>
  );
};

const UserRow = ({ user, isSelf }: { user: SafeUserItem; isSelf: boolean }) => {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<"superadmin" | "manager" | "support">(
    user.role,
  );
  const [isLocked, setIsLocked] = useState(user.isLocked ? "true" : "false");
  const [is2FA, setIs2FA] = useState(
    user.isTwoFactorEnabled ? "true" : "false",
  );

  const formId = `user-form-${user.id}`;

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUserAction(formData);
      if (result.success) toast.success("Пользователь обновлен");
      else toast.error(result.error);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Удалить учетную запись ${user.email}?`)) return;
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.success) toast.success("Учетная запись удалена");
      else toast.error(result.error);
    });
  };

  return (
    <tr className="transition-colors">
      <td className="px-4 py-4 align-top">
        <form id={formId} action={handleUpdate} className="hidden">
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="email" value={user.email} />
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="isLocked" value={isLocked} />
          <input type="hidden" name="isTwoFactorEnabled" value={is2FA} />
        </form>
        <div className="flex flex-col gap-2">
          <Input
            name="name"
            form={formId}
            defaultValue={user.name || ""}
            className="h-8 font-medium shadow-none"
            disabled={isPending}
          />
          <div className="text-muted-foreground bg-foreground/5 flex h-8 items-center rounded-md px-3 text-xs font-medium">
            {user.email}
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <Select
          value={role}
          onValueChange={(val) =>
            setRole(val as "superadmin" | "manager" | "support")
          }
          disabled={isPending || isSelf}
        >
          <SelectTrigger className="text-foreground h-8 w-32 bg-transparent text-xs font-medium shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <Select
            value={isLocked}
            onValueChange={setIsLocked}
            disabled={isPending || isSelf}
          >
            <SelectTrigger
              className={`h-8 w-32 border-none text-xs font-medium ${isLocked === "true" ? "bg-red-500 text-red-100 dark:bg-red-500" : "bg-green-500 text-green-100 dark:bg-green-500"}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Активен</SelectItem>
              <SelectItem value="true">Заблокирован</SelectItem>
            </SelectContent>
          </Select>
          <Select value={is2FA} onValueChange={setIs2FA} disabled={isPending}>
            <SelectTrigger className="h-8 w-32 text-xs font-medium shadow-none">
              <div className="flex items-center gap-2">
                {is2FA === "true" ? (
                  <ShieldCheck className="size-3 text-green-500" />
                ) : (
                  <ShieldAlert className="size-3 text-red-500" />
                )}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">2FA Вкл.</SelectItem>
              <SelectItem value="false">2FA Выкл.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <Input
          name="password"
          form={formId}
          type="password"
          placeholder="Оставьте пустым"
          className="text-foreground placeholder:text-muted-foreground h-8 font-medium shadow-none placeholder:font-normal"
          disabled={isPending}
        />
      </td>

      <td className="px-4 py-4 text-right align-top">
        <div className="flex flex-col items-end gap-2">
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
            size="sm"
            className="w-28"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="text-sm">Сохранить</span>
          </Button>
          {!isSelf && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="w-28"
            >
              <Trash2 className="mr-2 size-4" />
              <span className="text-sm">Удалить</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
