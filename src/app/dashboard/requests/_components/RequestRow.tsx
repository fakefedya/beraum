"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateRequestStatus } from "@/src/server/actions/requests";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { PanelRightOpen, Paperclip } from "lucide-react";
import type { RequestItem, FeedbackPayload } from "./RequestsTable";
import { CopyButton } from "@/src/components/shared/CopyButton";

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

const typeMap: Record<string, string> = {
  consultation: "Консультация",
  partnership: "Партнерство",
  support: "Поддержка",
  wholesale: "Дисконт",
};

export const RequestRow = ({
  req,
  onOpenDetails,
}: {
  req: RequestItem;
  onOpenDetails: (req: RequestItem) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const payload = req.payload as FeedbackPayload;
  const hasMedia =
    Array.isArray(payload.mediaKeys) && payload.mediaKeys.length > 0;

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", req.id);
      formData.append("status", newStatus);

      const result = await updateRequestStatus(formData);
      if (result.success) {
        toast.success("Статус обновлен");
      } else {
        toast.error(result.error || "Ошибка обновления");
      }
    });
  };

  const badgeProps = (() => {
    switch (typeMap[req.type]) {
      case "Консультация":
        return "text-teal-700 bg-teal-100";
      case "Партнерство":
        return "bg-rose-100 text-rose-700";
      case "Дисконт":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  })();
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="text-foreground text-xs font-semibold">
            {req.ticketNumber}
          </span>
          <CopyButton
            textToCopy={req.ticketNumber}
            className="text-muted-foreground hover:text-foreground h-6 w-6"
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {new Intl.DateTimeFormat("ru-RU", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(req.createdAt))}
          </span>
          <Badge className={`w-fit text-xs ${badgeProps}`}>
            {typeMap[req.type]}
          </Badge>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="text-foreground font-medium">{req.name}</span>
          <span className="text-muted-foreground text-xs">{req.phone}</span>
        </div>
      </td>
      <td className="max-w-xs px-6 py-4">
        <div className="flex flex-col items-start gap-2">
          {payload.modelArticle && (
            <p className="text-sm font-medium">
              {String(payload.modelArticle)}
            </p>
          )}
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {req.message}
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
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            className={`h-8 ${statusMap[req.status as keyof typeof statusMap].color} border-none font-medium shadow-none`}
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
          className="hover:bg-background/60 w-full border-none shadow-none"
          onClick={() => onOpenDetails(req)}
        >
          <PanelRightOpen className="size-4" />
          <span className="text-sm">Открыть</span>
        </Button>
      </td>
    </tr>
  );
};
