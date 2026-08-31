import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { desc, count } from "drizzle-orm";
import { UsersTable } from "./UsersTable";
import { CatalogPagination } from "@/src/app/(store)/catalog/[category]/_components/CatalogPagination";

const LIMIT = 25;

interface WrapperProps {
  page: number;
  currentUserId: string;
}

export const UsersTableWrapper = async ({
  page,
  currentUserId,
}: WrapperProps) => {
  const offset = (page - 1) * LIMIT;

  const [usersList, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isLocked: users.isLocked,
        isTwoFactorEnabled: users.isTwoFactorEnabled,
        createdAt: users.createdAt,
      }) // <-- Проекция применена и здесь!
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db.select({ totalCount: count() }).from(users),
  ]);

  const hasMore = offset + LIMIT < totalCount;

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <UsersTable initialData={usersList} currentUserId={currentUserId} />
        </div>
      </div>

      <div className="py-4">
        <CatalogPagination currentPage={page} hasMore={hasMore} />
      </div>
    </div>
  );
};
