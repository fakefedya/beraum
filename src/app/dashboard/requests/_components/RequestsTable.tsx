"use client";

import { useState, useTransition } from "react";
import { updateRequestStatus } from "@/src/server/actions/requests";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { feedbackRequests } from "@/src/server/db/schema";
import { RequestDetailsSheet } from "./RequestDetailsSheet";
import { Button } from "@/src/components/ui/button";
import { Paperclip } from "lucide-react";

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
  article?: string;
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

const statusMap = {
  new: {
    label: "Новая",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  in_progress: {
    label: "В работе",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  resolved: {
    label: "Решена",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
};

const typeMap = {
  consultation: "Консультация",
  partnership: "Партнерство",
  support: "Поддержка",
  wholesale: "Опт",
};

export const RequestsTable = ({ requests, categories }: RequestsTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", newStatus);

      const result = await updateRequestStatus(formData);

      if (result.success) {
        toast.success("Статус обновлен");
      } else {
        toast.error(result.error || "Ошибка обновления");
      }
    });
  };

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
                <th className="px-6 py-4 font-medium">Кратко</th>
                <th className="w-48 px-6 py-4 font-medium">Статус</th>
                <th className="w-24 px-6 py-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req) => {
                const payload = req.payload as FeedbackPayload;
                const hasMedia =
                  Array.isArray(payload.mediaKeys) &&
                  payload.mediaKeys.length > 0;

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-foreground font-mono text-xs font-semibold">
                        {req.ticketNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">
                          {new Intl.DateTimeFormat("ru-RU", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(req.createdAt))}
                        </span>
                        <Badge variant="outline" className="w-fit text-[10px]">
                          {typeMap[req.type]}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-semibold">
                          {req.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {req.phone}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {req.message ||
                            (payload.article
                              ? `Модель: ${payload.article}`
                              : "—")}
                        </p>
                        {hasMedia && (
                          <Paperclip className="text-brand-secondary-muted h-4 w-4 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        defaultValue={req.status}
                        disabled={isPending}
                        onValueChange={(val) => handleStatusChange(req.id, val)}
                      >
                        <SelectTrigger
                          className={`h-8 ${statusMap[req.status as keyof typeof statusMap].color} border-none font-medium`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Новая</SelectItem>
                          <SelectItem value="in_progress">В работе</SelectItem>
                          <SelectItem value="resolved">Решена</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
                      >
                        Открыть
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
