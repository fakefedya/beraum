"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  UploadCloud,
  Trash2,
  Loader2,
  Star,
  Maximize,
  Minimize,
} from "lucide-react";
import { cn, buildImageUrl } from "@/src/lib/utils";
import { getDiscountPresignedUploadUrl } from "@/src/server/actions/admin-discount";
import { toast } from "sonner";
import { SafeImage } from "@/src/components/shared/SafeImage";
import type { DiscountMedia } from "@/src/server/db/schema/discount.schema";

type UploadStatus = "uploading" | "success" | "error" | "existing";

interface UploadedFile {
  id: string;
  status: UploadStatus;
  key?: string;
  file?: File;
  previewUrl?: string;
  isCover: boolean;
  fit: "contain" | "cover";
}

interface DiscountMediaUploaderProps {
  maxFiles?: number;
  initialMedia?: (DiscountMedia | string)[];
  onUploadingChange?: (isUploading: boolean) => void;
}

export const DiscountMediaUploader = ({
  maxFiles = 15,
  initialMedia = [],
  onUploadingChange,
}: DiscountMediaUploaderProps) => {
  const blobUrls = useRef<Set<string>>(new Set());

  const createBlobUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    blobUrls.current.add(url);
    return url;
  };

  const revokeBlobUrl = (url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      blobUrls.current.delete(url);
    }
  };

  useEffect(() => {
    return () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrls.current.clear();
    };
  }, []);

  const [files, setFiles] = useState<UploadedFile[]>(() => {
    return initialMedia.map((m) => {
      const isString = typeof m === "string";
      const key = isString ? m : m.key;
      return {
        id: key,
        status: "existing",
        key,
        isCover: isString ? false : m.isCover,
        fit: isString ? "contain" : m.fit,
        previewUrl: buildImageUrl(
          { bucketName: "discount-products", fileKey: key },
          "discount-products",
        ),
      };
    });
  });

  const isUploading = files.some((f) => f.status === "uploading");

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;

      if (target.previewUrl) revokeBlobUrl(target.previewUrl);

      const next = prev.filter((f) => f.id !== id);
      if (target.isCover && next.length > 0) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const setCover = (id: string) => {
    setFiles((prev) => prev.map((f) => ({ ...f, isCover: f.id === id })));
  };

  const toggleFit = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, fit: f.fit === "contain" ? "cover" : "contain" }
          : f,
      ),
    );
  };

  const uploadFile = async (uploadItem: UploadedFile) => {
    if (!uploadItem.file) return;
    try {
      const res = await getDiscountPresignedUploadUrl({
        contentType: uploadItem.file.type,
        fileSize: uploadItem.file.size,
      });

      if (
        !res.success ||
        !("url" in res) ||
        !("fields" in res) ||
        !("fileKey" in res)
      ) {
        throw new Error(
          !res.success && "error" in res
            ? String(res.error)
            : "Сбой генерации ссылки S3",
        );
      }

      const formData = new FormData();
      Object.entries(res.fields).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", uploadItem.file);

      const uploadRes = await fetch(res.url, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Сбой загрузки в хранилище");

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadItem.id
            ? { ...f, status: "success", key: res.fileKey }
            : f,
        ),
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadItem.id ? { ...f, status: "error" } : f,
        ),
      );
      toast.error("Ошибка загрузки фото");
    }
  };

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        return toast.warning(`Максимум ${maxFiles} фотографий`);
      }

      const hasCover = files.some((f) => f.isCover);

      newFiles.forEach((file, index) => {
        const id = crypto.randomUUID();
        const uploadItem: UploadedFile = {
          id,
          file,
          status: "uploading",
          previewUrl: createBlobUrl(file),
          isCover: !hasCover && index === 0,
          fit: "contain",
        };
        setFiles((prev) => [...prev, uploadItem]);
        uploadFile(uploadItem);
      });
    },
    [files, maxFiles],
  );

  const validFiles = files.filter(
    (f) => f.status === "success" || f.status === "existing",
  );

  const mediaPayload = validFiles.map((f) => ({
    key: f.key,
    isCover: f.isCover,
    fit: f.fit,
  }));

  return (
    <div className="flex flex-col gap-4">
      <input
        type="hidden"
        name="mediaPayload"
        value={JSON.stringify(mediaPayload)}
      />

      <div className="grid grid-cols-2 gap-4">
        {files.map((f) => (
          <div
            key={f.id}
            className={cn(
              "group border-border relative aspect-square overflow-hidden rounded-xl border transition-all",
              f.fit === "contain" ? "bg-white" : "bg-muted",
              f.status === "error" && "border-red-500 opacity-50",
            )}
          >
            {f.previewUrl && (
              <SafeImage
                src={f.previewUrl}
                alt="Превью дефекта"
                fill
                className={cn(
                  "transition-all duration-300",
                  f.fit === "cover" ? "object-cover" : "object-contain",
                  f.status === "uploading" && "opacity-50 blur-sm",
                )}
                sizes="(max-width: 768px) 50vw, 300px"
              />
            )}

            {f.status === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-foreground h-6 w-6 animate-spin" />
              </div>
            )}

            {f.status !== "uploading" && (
              <>
                {f.isCover ? (
                  <span className="bg-brand absolute right-2 bottom-2 z-10 rounded px-2 py-0.5 text-[10px] font-medium text-black shadow-sm">
                    ОБЛОЖКА
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCover(f.id)}
                    className="bg-background/90 text-muted-foreground hover:text-foreground absolute top-2 left-2 z-10 rounded p-1.5 opacity-0 transition-opacity outline-none group-hover:opacity-100 focus:opacity-100"
                    title="Сделать обложкой"
                  >
                    <Star className="size-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleFit(f.id)}
                  className="bg-background/90 text-muted-foreground hover:text-foreground absolute top-2 left-10 z-10 rounded p-1.5 opacity-0 transition-opacity outline-none group-hover:opacity-100 focus:opacity-100"
                  title={f.fit === "cover" ? "Вписать" : "Заполнить"}
                >
                  {f.fit === "cover" ? (
                    <Minimize className="size-4" />
                  ) : (
                    <Maximize className="size-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="absolute top-2 right-2 z-10 rounded bg-red-500 p-1.5 text-white opacity-0 transition-opacity outline-none group-hover:opacity-100 focus:opacity-100"
                  title="Удалить"
                >
                  <Trash2 className="size-4" />
                </button>
              </>
            )}
          </div>
        ))}

        {files.length < maxFiles && (
          <label
            className={cn(
              "hover:bg-muted/50 border-ring/30 group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-200",
              isUploading && "pointer-events-none opacity-50",
            )}
          >
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp, image/avif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
              disabled={isUploading}
            />
            <UploadCloud className="text-muted-foreground group-hover:text-foreground h-8 w-8 transition-colors" />
            <span className="text-muted-foreground text-xs font-medium">
              Загрузить
            </span>
          </label>
        )}
      </div>
    </div>
  );
};
