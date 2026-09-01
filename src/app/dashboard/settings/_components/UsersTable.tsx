"use client";

import { UserRow } from "./UserRow";

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
    <div className="bg-muted overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
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
      </div>
    </div>
  );
};
