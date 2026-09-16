import { DiscountItemDTO } from "./DiscountItemsTable";
import { useTransition } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDiscountItemAction } from "@/src/server/actions/admin-discount";
import { EditDiscountItemSheet } from "./EditDiscountItemSheet";
import { CopyButton } from "@/src/components/shared/CopyButton";

export const DiscountItemRow = ({ item }: { item: DiscountItemDTO }) => {
  const [isDeleting, startDelete] = useTransition();

  const statusMap = {
    available: {
      label: "Доступен",
      cls: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    },
    reserved: {
      label: "Бронь",
      cls: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    sold: {
      label: "Продан",
      cls: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    },
  } as const;

  const handleDelete = () => {
    if (!confirm("Удалить этот экземпляр навсегда?")) return;
    startDelete(async () => {
      const res = await deleteDiscountItemAction(item.id);
      if (res.success) toast.success("Экземпляр удален");
      else toast.error(res.error);
    });
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-foreground text-xs font-medium">
              {item.uniqueSku}
            </span>
            <CopyButton
              textToCopy={item.uniqueSku}
              className="text-muted-foreground hover:text-foreground h-6 w-6"
            />
          </div>
          <span className="text-muted-foreground text-xs font-medium">
            {item.baseArticle}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <Badge className={`shadow-none ${statusMap[item.status].cls}`}>
          {statusMap[item.status].label}
        </Badge>
      </td>
      <td className="px-4 py-4 align-top">
        <span className="text-muted-foreground text-xs font-medium">
          {item.categoryName}
        </span>
      </td>

      <td
        className="max-w-xs truncate px-4 py-4 align-top text-xs"
        title={item.defectDescription}
      >
        <span className="text-muted-foreground text-xs font-medium">
          {item.defectDescription}
        </span>
      </td>
      <td className="px-4 py-4 align-top">
        <span className="text-sm font-medium">
          {item.discountPrice.toLocaleString("ru-RU")} ₽
        </span>
      </td>
      <td className="px-4 py-4 text-right align-top">
        <div className="flex flex-col gap-2">
          <EditDiscountItemSheet item={item} />

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            <span className="text-sm">Удалить</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};
