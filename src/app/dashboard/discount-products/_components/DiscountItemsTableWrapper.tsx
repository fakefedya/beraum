import { getAdminDiscountItems } from "@/src/server/queries/admin-discount";
import { CatalogPagination } from "@/src/app/(store)/catalog/[category]/_components/CatalogPagination";
import { DiscountItemsTable } from "./DiscountItemsTable";

export const DiscountItemsTableWrapper = async ({ page }: { page: number }) => {
  const { data, hasMore } = await getAdminDiscountItems(page);

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <DiscountItemsTable initialData={data} />
        </div>
      </div>
      <div className="py-4">
        <CatalogPagination currentPage={page} hasMore={hasMore} />
      </div>
    </div>
  );
};
