"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { buildImageUrl, cn } from "@/src/lib/utils";
import type { slides } from "@/src/server/db/schema";
import {
  deleteBannerAction,
  upsertBannerAction,
} from "@/src/server/actions/admin-banners";
import { BannerSheet } from "./BannerSheet";
import { Edit2 } from "lucide-react";

type SlideItem = typeof slides.$inferSelect;

export const BannerRow = ({ slide }: { slide: SlideItem }) => {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isActive, setIsActive] = useState<string>(
    slide.isActive ? "true" : "false",
  );

  const formId = `banner-form-${slide.id}`;

  const imageUrl = buildImageUrl({
    bucketName: slide.bucketName,
    fileKey: `components/banners/${slide.fileKey}`,
  });

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      formData.append("payload", JSON.stringify(slide.payload));
      formData.append("isActive", isActive);

      const result = await upsertBannerAction(formData);
      if (result.success) {
        toast.success("Баннер обновлен");
      } else {
        toast.error(result.error || "Ошибка обновления");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Удалить этот баннер?")) return;

    startDeleteTransition(async () => {
      const result = await deleteBannerAction(slide.id);
      if (result.success) {
        toast.success("Баннер удален");
      } else {
        toast.error(result.error || "Ошибка удаления");
      }
    });
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-4 align-top">
        <div className="bg-accent relative flex aspect-video w-24 items-center justify-center overflow-hidden rounded-md border">
          {slide.fileKey ? (
            <SafeImage
              src={imageUrl}
              alt={slide.internalTitle}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <ImageIcon className="text-muted-foreground size-6 opacity-50" />
          )}
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <form id={formId} action={handleUpdate} className="hidden">
          <input type="hidden" name="id" value={slide.id} />
          <input
            type="hidden"
            name="internalTitle"
            value={slide.internalTitle}
          />
          <input type="hidden" name="placement" value={slide.placement} />
          <input type="hidden" name="type" value={slide.type} />
          <input type="hidden" name="fileKey" value={slide.fileKey} />
          {slide.mobileFileKey && (
            <input
              type="hidden"
              name="mobileFileKey"
              value={slide.mobileFileKey}
            />
          )}
        </form>
        <div className="flex flex-col gap-1">
          <span
            className="text-foreground max-w-50 truncate font-semibold"
            title={slide.internalTitle}
          >
            {slide.internalTitle}
          </span>
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            {slide.placement === "home_hero" ? "Главная" : "Каталог"}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-1">
          <span className="bg-muted w-fit rounded-sm px-2 py-0.5 text-xs font-medium">
            {slide.type}
          </span>
          <span className="text-muted-foreground max-w-50 truncate font-mono text-[10px]">
            {JSON.stringify(slide.payload)}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <Input
          name="sortOrder"
          form={formId}
          type="number"
          defaultValue={slide.sortOrder}
          className="h-8 w-16 text-xs"
          disabled={isPending || isDeleting}
        />
      </td>

      <td className="px-4 py-4 align-top">
        <Select
          value={isActive}
          onValueChange={setIsActive}
          disabled={isPending || isDeleting}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Активен</SelectItem>
            <SelectItem value="false">Скрыт</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className="px-4 py-4 text-right align-top">
        <div className="flex flex-col gap-2">
          <BannerSheet
            slide={slide}
            trigger={
              <Button variant="outline" size="sm" className="w-full">
                <Edit2 className="mr-2 size-4" /> Изменить
              </Button>
            }
          />

          <Button
            type="submit"
            form={formId}
            disabled={isPending || isDeleting}
            size="sm"
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Быстрое сохр.
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            className="w-full"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            Удалить
          </Button>
        </div>
      </td>
    </tr>
  );
};
