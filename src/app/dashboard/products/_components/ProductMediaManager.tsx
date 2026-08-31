"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Images, Loader2, Trash2, UploadCloud, Star } from "lucide-react";
import { toast } from "sonner";
import {
  getProductAssetsAction,
  deleteProductAssetAction,
  getAdminPresignedUploadUrl,
  saveProductImageAction,
  setProductImageCoverAction,
  saveProductDocumentAction,
} from "@/src/server/actions/admin-media";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { buildImageUrl, cn } from "@/src/lib/utils";
import type { productImages, productDocuments } from "@/src/server/db/schema";

type ProductImage = typeof productImages.$inferSelect;
type ProductDocument = typeof productDocuments.$inferSelect;
type DocumentType = "user_instruction" | "service_instruction" | "certificate";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  user_instruction: "Руководство пользователя",
  service_instruction: "Схема встраивания",
  certificate: "Сертификат соответствия",
};

export const ProductMediaManager = ({
  productId,
  article,
}: {
  productId: string;
  article: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<{
    images: ProductImage[];
    docs: ProductDocument[];
  }>({
    images: [],
    docs: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [docType, setDocType] = useState<DocumentType>("user_instruction");

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const data = await getProductAssetsAction(productId);
      setAssets(data);
    } catch (e) {
      toast.error("Ошибка загрузки медиа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) fetchAssets();
  };

  const handleDelete = async (id: string, type: "image" | "document") => {
    const res = await deleteProductAssetAction(id, type);

    if (res.success) {
      toast.success("Файл удален");
      fetchAssets();
    } else {
      toast.error(res.error);
    }
  };

  const handleSetCover = async (imageId: string) => {
    const res = await setProductImageCoverAction(imageId, productId);
    if (res.success) {
      toast.success("Обложка обновлена");
      fetchAssets();
    } else {
      toast.error(res.error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setIsUploadingImg(true);

    for (const file of files) {
      try {
        const preSignRes = await getAdminPresignedUploadUrl({
          contentType: file.type,
          fileSize: file.size,
          productId,
          assetType: "image",
        });

        if (
          !preSignRes.success ||
          !("url" in preSignRes) ||
          !("fields" in preSignRes) ||
          !("fileKey" in preSignRes)
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

        if (!uploadRes.ok) throw new Error("S3 Upload Failed");

        await saveProductImageAction({
          productId,
          fileKey: preSignRes.fileKey,
          isCover: assets.images.length === 0,
          imageFit: "contain",
        });
        toast.success(`Фото ${file.name} загружено`);
      } catch (err) {
        toast.error(`Ошибка загрузки ${file.name}`);
      }
    }
    setIsUploadingImg(false);
    e.target.value = "";
    fetchAssets();
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const generatedTitle = `${DOC_TYPE_LABELS[docType]} ${article}`;

    setIsUploadingDoc(true);
    try {
      const preSignRes = await getAdminPresignedUploadUrl({
        contentType: file.type,
        fileSize: file.size,
        productId,
        assetType: "document",
      });

      if (
        !preSignRes.success ||
        !("url" in preSignRes) ||
        !("fields" in preSignRes) ||
        !("fileKey" in preSignRes)
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

      if (!uploadRes.ok) throw new Error("S3 Upload Failed");

      const saveRes = await saveProductDocumentAction({
        productId,
        fileKey: preSignRes.fileKey,
        type: docType,
        title: generatedTitle,
      });

      if (saveRes.success) {
        toast.success(`Документ сохранен`);
      } else {
        toast.error(saveRes.error);
      }
    } catch (err) {
      toast.error(`Ошибка загрузки ${file.name}`);
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
      fetchAssets();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-brand-secondary-muted hover:text-brand-secondary w-full"
        >
          <Images className="mr-2 size-4" /> Медиа
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-6">
          <SheetTitle>Медиафайлы: {article}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h3 className="border-b pb-2 text-lg font-semibold">
                Изображения
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {assets.images.map((img) => (
                  <div
                    key={img.id}
                    className="group border-border relative aspect-square overflow-hidden rounded-xl border"
                  >
                    <SafeImage
                      src={buildImageUrl({
                        fileKey: img.fileKey,
                        bucketName: img.bucketName,
                      })}
                      alt="img"
                      fill
                      className="object-cover"
                    />

                    {img.isCover ? (
                      <span className="bg-brand absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold text-black shadow-sm">
                        ОБЛОЖКА
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetCover(img.id)}
                        className="bg-background/90 text-muted-foreground hover:text-foreground absolute top-2 left-2 rounded p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                        title="Сделать обложкой"
                      >
                        <Star className="size-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(img.id, "image")}
                      className="absolute top-2 right-2 rounded bg-red-500 p-1.5 text-white opacity-0 transition-opacity outline-none group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                <label
                  className={cn(
                    "hover:bg-muted/50 border-ring/30 group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-200",
                    isUploadingImg && "pointer-events-none opacity-50",
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImg}
                  />
                  {isUploadingImg ? (
                    <Loader2 className="text-muted-foreground size-8 animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="text-muted-foreground group-hover:text-foreground size-8 transition-colors" />
                      <span className="text-muted-foreground text-xs font-medium">
                        Загрузить фото
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="border-b pb-2 text-lg font-semibold">
                Инструкции и сертификаты
              </h3>

              <div className="bg-muted/30 border-border flex flex-col gap-3 rounded-xl border p-4">
                <span className="text-sm font-medium">
                  Добавить документ (PDF)
                </span>
                <div className="flex gap-2">
                  <Select
                    value={docType}
                    onValueChange={(val: DocumentType) => setDocType(val)}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_instruction">
                        Руководство пользователя
                      </SelectItem>
                      <SelectItem value="service_instruction">
                        Инструкция по установке
                      </SelectItem>
                      <SelectItem value="certificate">
                        Сертификат соответствия
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  asChild
                  variant="secondary"
                  className="mt-1 w-full cursor-pointer"
                  disabled={isUploadingDoc}
                >
                  <label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleDocUpload}
                      disabled={isUploadingDoc}
                    />
                    {isUploadingDoc ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 size-4" />
                    )}
                    Выбрать и загрузить PDF
                  </label>
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {assets.docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-background flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        {doc.title}
                      </span>
                      <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        {doc.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id, "document")}
                      className="shrink-0 p-2 text-red-500 outline-none hover:text-red-700 focus:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                {assets.docs.length === 0 && (
                  <span className="text-muted-foreground py-4 text-center text-sm">
                    Документов пока нет
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
