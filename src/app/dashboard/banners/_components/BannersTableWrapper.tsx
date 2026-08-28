import { db } from "@/src/server/db/client";
import { slides } from "@/src/server/db/schema";
import { desc } from "drizzle-orm";
import { BannersTable } from "./BannersTable";

export const BannersTableWrapper = async () => {
  const data = await db
    .select()
    .from(slides)
    .orderBy(desc(slides.placement), desc(slides.sortOrder));

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <BannersTable initialData={data} />
        </div>
      </div>
    </div>
  );
};
