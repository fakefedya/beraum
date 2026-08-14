"use client";

import { useState, useCallback } from "react";
import {
  UploadCloud,
  X,
  File as FileIcon,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getPresignedUploadUrl } from "@/src/server/actions/media.actions";
import { toast } from "sonner";
import { SUPPORT_MEDIA_CONFIG } from "@/src/lib/constants";

type UploadStatus = "uploading" | "success" | "error";

interface UploadedFile {
  id: string;
  file: File;
  status: UploadStatus;
  key?: string;
  error?: string;
}

export const MediaUploader = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const { MAX_FILES, MAX_SIZE_MB, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } =
    SUPPORT_MEDIA_CONFIG;

  const updateFile = (id: string, data: Partial<UploadedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadItem: UploadedFile) => {
    const { id, file } = uploadItem;

    try {
      const res = await getPresignedUploadUrl({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (!res.success || !res.url || !res.fileKey) {
        throw new Error(res.error || "Ошибка получения ссылки");
      }

      const uploadRes = await fetch(res.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Ошибка при загрузке файла");

      updateFile(id, { status: "success", key: res.fileKey });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Сбой загрузки";
      updateFile(id, {
        status: "error",
        error: errorMessage,
      });
      toast.error("Ошибка загрузки", {
        description: `Не удалось загрузить "${file.name}". ${errorMessage}`,
      });
    }
  };

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > MAX_FILES) {
        toast.warning("Лимит файлов", {
          description: `Вы можете загрузить максимум ${MAX_FILES} файлов.`,
        });
        return;
      }

      const validFiles = newFiles.filter((file) => {
        const extension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        const isValidType =
          (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type) ||
          (ALLOWED_EXTENSIONS as readonly string[]).includes(extension);

        if (!isValidType) {
          toast.error("Недопустимый формат", {
            description: `Файл "${file.name}" не поддерживается. Разрешены форматы: ${ALLOWED_EXTENSIONS.join(", ")}`,
          });
          return false;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error("Файл слишком большой", {
            description: `Размер "${file.name}" превышает допустимые ${MAX_SIZE_MB} МБ.`,
          });
          return false;
        }
        return true;
      });

      validFiles.forEach((file) => {
        const id = crypto.randomUUID();
        const uploadItem: UploadedFile = { id, file, status: "uploading" };
        setFiles((prev) => [...prev, uploadItem]);
        uploadFile(uploadItem);
      });
    },
    [
      files.length,
      ALLOWED_MIME_TYPES,
      ALLOWED_EXTENSIONS,
      MAX_FILES,
      MAX_SIZE_MB,
    ],
  );

  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <div className="flex flex-col gap-4" data-uploading={isUploading}>
      {files.map((f) => {
        if (f.status === "success" && f.key) {
          return (
            <input key={f.id} type="hidden" name="mediaKeys" value={f.key} />
          );
        }
        return null;
      })}

      <h3 className="text-center text-2xl font-medium">Материалы</h3>

      <div className="bg-card text-foreground flex items-center gap-3 rounded-2xl p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          Если на устройство действует гарантийный срок, пожалуйста, прикрепите
          фото или скан чека о приобретении. Срок указан в гарантийном талоне.
        </p>
      </div>

      <label
        className={cn(
          "hover:bg-card group border-ring/30 relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-transparent p-8 text-center transition-all duration-200",
          "focus-within:border-brand-secondary focus-within:ring-brand-secondary focus-within:ring-2",
          files.length >= MAX_FILES && "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="sr-only"
          disabled={files.length >= MAX_FILES}
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
        <UploadCloud className="text-muted-foreground group-hover:text-foreground mx-auto h-8 w-8 transition-colors" />
        <p className="text-sm font-medium">
          Загрузить чек, фото или видео неисправности
        </p>
        <p className="text-muted-foreground text-xs">
          До {MAX_FILES} файлов. Макс. {MAX_SIZE_MB} МБ.
        </p>
      </label>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="bg-card flex items-center justify-between rounded-xl p-3 pr-4"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  {f.status === "uploading" ? (
                    <Loader2 className="text-brand-secondary h-5 w-5 animate-spin" />
                  ) : f.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <FileIcon className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {f.file.name}
                  </span>
                  {f.status === "error" ? (
                    <span className="text-xs text-red-500">{f.error}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {(f.file.size / 1024 / 1024).toFixed(2)} МБ
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="text-muted-foreground hover:text-foreground rounded-sm p-1 transition-colors outline-none focus:ring-2 focus:ring-black"
                aria-label="Удалить файл"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
