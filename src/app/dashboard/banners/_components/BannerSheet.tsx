"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Loader2, Plus, UploadCloud, X } from "lucide-react";
import {
  upsertBannerAction,
  getBannerPresignedUploadUrl,
} from "@/src/server/actions/admin-banners";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { buildImageUrl, cn } from "@/src/lib/utils";
import type { slides } from "@/src/server/db/schema";
import type { SlidePayload } from "@/src/server/db/schema/marketing.schema";

type SlideItem = typeof slides.$inferSelect;

export const BannerSheet = ({
  slide,
  trigger,
}: {
  slide?: SlideItem;
  trigger?: React.ReactNode;
}) => {
  const isEdit = !!slide;
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<"promo_product" | "promo_information">(
    (slide?.type as "promo_product" | "promo_information") ||
      "promo_information",
  );

  const [fileKey, setFileKey] = useState(slide?.fileKey || "");
  const [mobileFileKey, setMobileFileKey] = useState(
    slide?.mobileFileKey || "",
  );
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const defaultInfo = { title: "", description: "", buttonText: "", href: "/" };
  const defaultTags =
    '[\n  {\n    "xPercent": 50,\n    "yPercent": 50,\n    "title": "SKU",\n    "subtitle": "Описание",\n    "href": "/catalog/hob"\n  }\n]';

  let initInfo = defaultInfo;
  let initTags = defaultTags;

  if (slide?.payload) {
    const p = slide.payload as SlidePayload;
    if (slide.type === "promo_information" && "title" in p) {
      initInfo = {
        title: p.title || "",
        description: p.description || "",
        buttonText: p.buttonText || "",
        href: p.href || "/",
      };
    } else if (slide.type === "promo_product" && "tags" in p) {
      initTags = JSON.stringify(p.tags || [], null, 2);
    }
  }

  const [payloadInfo, setPayloadInfo] = useState(initInfo);
  const [tagsJson, setTagsJson] = useState(initTags);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "desktop" | "mobile",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(`Файл ${file.name} не является изображением`);
      return;
    }

    const setUploading =
      target === "desktop" ? setIsUploadingDesktop : setIsUploadingMobile;
    const setKey = target === "desktop" ? setFileKey : setMobileFileKey;

    setUploading(true);
    try {
      const preSignRes = await getBannerPresignedUploadUrl({
        contentType: file.type,
        fileSize: file.size,
      });

      if (
        !preSignRes.success ||
        !("url" in preSignRes) ||
        !("fields" in preSignRes) ||
        !("fileName" in preSignRes)
      ) {
        throw new Error(
          "error" in preSignRes ? String(preSignRes.error) : "Ошибка S3",
        );
      }

      const formData = new FormData();
      Object.entries(preSignRes.fields).forEach(([k, v]) =>
        formData.append(k, v as string),
      );
      formData.append("file", file);

      const uploadRes = await fetch(preSignRes.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Ошибка физической загрузки в MinIO");

      setKey(preSignRes.fileName);
      toast.success("Файл успешно загружен");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Неизвестная ошибка загрузки";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAction = (formData: FormData) => {
    if (!fileKey) {
      toast.error("Требуется изображение для десктопа!");
      return;
    }

    if (slide?.id) formData.append("id", slide.id);
    formData.append("type", type);

    formData.append("fileKey", fileKey);
    formData.append("mobileFileKey", mobileFileKey);

    let payloadData;
    if (type === "promo_information") {
      payloadData = payloadInfo;
    } else {
      try {
        payloadData = { tags: JSON.parse(tagsJson) };
        if (!Array.isArray(payloadData.tags))
          throw new Error("Tags must be an array");
      } catch (e) {
        toast.error("Невалидный JSON для точек товара");
        return;
      }
    }

    formData.append("payload", JSON.stringify(payloadData));

    startTransition(async () => {
      const result = await upsertBannerAction(formData);
      if (result.success) {
        toast.success(isEdit ? "Баннер обновлен!" : "Баннер создан!");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Ошибка сохранения");
      }
    });
  };

  const renderFilePreview = (
    key: string,
    label: string,
    isUploading: boolean,
    onClear: () => void,
  ) => {
    if (isUploading) {
      return (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      );
    }

    if (key) {
      const url = buildImageUrl({
        bucketName: "system-assets",
        fileKey: `components/banners/${key}`,
      });
      return (
        <div className="group border-border bg-accent relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border">
          <SafeImage src={url} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 rounded-md bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-foreground text-background hover:bg-foreground/80 h-10 px-4 font-medium">
            <Plus className="mr-2 size-4" /> Добавить слайд
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className={cn(
          "flex h-auto w-full flex-col gap-0 border-none p-0",
          "sm:max-w-md",
          "md:inset-y-4 md:right-4 md:rounded-4xl",
        )}
      >
        <SheetHeader className="px-6 pt-6 text-left">
          <SheetTitle className="text-xl">
            {isEdit ? "Редактирование слайда" : "Новый слайд"}
          </SheetTitle>
        </SheetHeader>

        <form action={handleAction} className="h-[calc(100%-68px)]">
          {isEdit && (
            <>
              <input
                type="hidden"
                name="isActive"
                value={slide.isActive ? "true" : "false"}
              />
              <input type="hidden" name="sortOrder" value={slide.sortOrder} />
            </>
          )}
          <div className="flex max-h-[calc(100%-112px)] flex-1 flex-col gap-8 overflow-y-auto p-6">
            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Название (внутреннее) <span className="text-red-500">*</span>
              </label>
              <Input
                name="internalTitle"
                required
                disabled={isPending}
                defaultValue={slide?.internalTitle}
                className="bg-background shadow-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Расположение <span className="text-red-500">*</span>
              </label>
              <Select
                name="placement"
                defaultValue={slide?.placement || "home_hero"}
                disabled={isPending}
              >
                <SelectTrigger className="bg-background w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">Главная страница</SelectItem>
                  <SelectItem value="catalog_hero">Каталог</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Тип контента <span className="text-red-500">*</span>
              </label>
              <Select
                value={type}
                onValueChange={(val: string) =>
                  setType(val as "promo_product" | "promo_information")
                }
                disabled={isPending || isEdit}
              >
                <SelectTrigger className="bg-background w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo_information">
                    Информационный (Текст + Кнопка)
                  </SelectItem>
                  <SelectItem value="promo_product">
                    Товарный (Точки на фото)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Изображение для ПК <span className="text-red-500">*</span>
              </label>
              {renderFilePreview(fileKey, "Desktop", isUploadingDesktop, () =>
                setFileKey(""),
              )}
              {!fileKey && !isUploadingDesktop && (
                <label className="hover:bg-muted/50 border-ring/30 flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "desktop")}
                  />
                  <UploadCloud className="text-muted-foreground size-6" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Загрузить фото (16:9)
                  </span>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground font-medium">
                Изображение для телефона
              </label>
              {renderFilePreview(
                mobileFileKey,
                "Mobile",
                isUploadingMobile,
                () => setMobileFileKey(""),
              )}
              {!mobileFileKey && !isUploadingMobile && (
                <label className="hover:bg-muted/50 border-ring/30 flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "mobile")}
                  />
                  <UploadCloud className="text-muted-foreground size-6" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Загрузить фото (9:16)
                  </span>
                </label>
              )}
            </div>

            {type === "promo_information" && (
              <div className="flex flex-col gap-2">
                <span className="text-foreground font-medium">
                  Настройки Payload
                </span>
                <Input
                  placeholder="Заголовок"
                  value={payloadInfo.title}
                  onChange={(e) =>
                    setPayloadInfo({ ...payloadInfo, title: e.target.value })
                  }
                  disabled={isPending}
                />
                <Input
                  placeholder="Описание"
                  value={payloadInfo.description}
                  onChange={(e) =>
                    setPayloadInfo({
                      ...payloadInfo,
                      description: e.target.value,
                    })
                  }
                  disabled={isPending}
                />
                <Input
                  placeholder="Текст кнопки"
                  value={payloadInfo.buttonText}
                  onChange={(e) =>
                    setPayloadInfo({
                      ...payloadInfo,
                      buttonText: e.target.value,
                    })
                  }
                  disabled={isPending}
                />
                <Input
                  placeholder="Ссылка (напр. /catalog/hob)"
                  value={payloadInfo.href}
                  onChange={(e) =>
                    setPayloadInfo({ ...payloadInfo, href: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
            )}

            {type === "promo_product" && (
              <div className="flex flex-col gap-2">
                <span className="text-foreground font-medium">
                  Точки (JSON)
                </span>

                <textarea
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-50 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={tagsJson}
                  onChange={(e) => setTagsJson(e.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
          </div>
          <div className="bg-background mt-auto rounded-4xl p-6">
            <Button
              type="submit"
              disabled={isPending || isUploadingDesktop || isUploadingMobile}
              className="mt-4 h-12 w-full"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isEdit ? "Сохранить изменения" : "Создать слайд"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
