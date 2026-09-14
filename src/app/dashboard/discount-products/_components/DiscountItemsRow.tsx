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
    available: { label: "Доступен", cls: "bg-green-100 text-green-800" },
    reserved: { label: "Бронь", cls: "bg-yellow-100 text-yellow-800" },
    sold: { label: "Продан", cls: "bg-gray-100 text-gray-800" },
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
    <tr className="bg-muted hover:bg-muted/70 transition-colors">
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="text-foreground text-sm font-semibold">
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
        <span className="text-muted-foreground text-xs font-medium">
          {item.categoryName}
        </span>
      </td>
      <td className="px-4 py-4 align-top">
        <Badge className={`shadow-none ${statusMap[item.status].cls}`}>
          {statusMap[item.status].label}
        </Badge>
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
