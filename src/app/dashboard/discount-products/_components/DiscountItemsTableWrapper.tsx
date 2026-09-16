import { getAdminDiscountItems } from "@/src/server/queries/admin-discount";
import { DashboardPagination } from "@/src/app/dashboard/_components/DashboardPagination";
import { DiscountItemsTable } from "./DiscountItemsTable";

export const DiscountItemsTableWrapper = async ({
  page,
  query,
  status,
}: {
  page: number;
  query: string;
  status: string;
}) => {
  const { data, hasMore } = await getAdminDiscountItems(page, query, status);

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <DiscountItemsTable initialData={data} />
        </div>
      </div>
      <div className="py-4">
        <DashboardPagination currentPage={page} hasMore={hasMore} />
      </div>
    </div>
  );
};
