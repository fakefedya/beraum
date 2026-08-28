import {
  getFeedbackRequests,
  RequestStatus,
  RequestType,
} from "@/src/server/queries/requests";
import { getCategoriesList } from "@/src/server/queries/categories";
import { RequestsTable } from "./RequestsTable";
import { CatalogPagination } from "@/src/app/(store)/catalog/[category]/_components/CatalogPagination";

const LIMIT = 25;

interface WrapperProps {
  type: RequestType;
  status: RequestStatus;
  query: string;
  page: number;
}

export const RequestsTableWrapper = async ({
  type,
  status,
  query,
  page,
}: WrapperProps) => {
  const offset = (page - 1) * LIMIT;

  const [{ data: requests, totalCount }, { data: categories }] =
    await Promise.all([
      getFeedbackRequests(type, status, query, LIMIT, offset),
      getCategoriesList(),
    ]);

  const hasMore = offset + LIMIT < (totalCount || 0);

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <RequestsTable requests={requests || []} categories={categories || []} />
      <div className="py-4">
        <CatalogPagination currentPage={page} hasMore={hasMore} />
      </div>
    </div>
  );
};
