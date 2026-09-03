"use client";

import { useState } from "react";

import type { feedbackRequests } from "@/src/server/db/schema";
import { RequestDetailsSheet } from "./RequestDetailsSheet";

import { RequestRow } from "./RequestRow";

export type RequestItem = typeof feedbackRequests.$inferSelect;

export interface FeedbackPayload {
  // Базовые
  city?: string;
  sourcePage?: string;
  // Партнерство
  companyName?: string;
  inn?: string;
  volume?: string;
  // Консультация
  topic?: string;
  // Поддержка
  categoryId?: string;
  modelArticle?: string;
  purchaseDate?: string;
  purchasePlace?: string;
  mediaKeys?: string[];
  // Опт
  techType?: string;

  [key: string]: unknown;
}

interface RequestsTableProps {
  requests: RequestItem[];
  categories: { id: string; name: string }[];
}

export const RequestsTable = ({ requests, categories }: RequestsTableProps) => {
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );

  if (!requests.length) {
    return (
      <div className="text-muted-foreground bg-card rounded-xl border p-8 text-center">
        Заявок по этим фильтрам не найдено
      </div>
    );
  }

  return (
    <>
      <div className="bg-muted overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground bg-muted/50 border-b text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Дата / Тип</th>
                <th className="px-6 py-4 font-medium">Клиент</th>
                <th className="px-6 py-4 font-medium">Описание</th>
                <th className="w-48 px-6 py-4 font-medium">Статус</th>
                <th className="w-24 px-6 py-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  onOpenDetails={setSelectedRequest}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailsSheet
        request={selectedRequest}
        categories={categories}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
};
