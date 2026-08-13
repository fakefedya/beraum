"use client";

import { useState, useCallback } from "react";
import {
  UploadCloud,
  X,
  File as FileIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getPresignedUploadUrl } from "@/src/server/actions/media.actions";

type UploadStatus = "uploading" | "success" | "error";

interface UploadedFile {
  id: string;
  file: File;
  status: UploadStatus;
  key?: string;
  error?: string;
}

interface MediaUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/pdf",
];

export const MediaUploader = ({
  maxFiles = 5,
  maxSizeMB = 50,
}: MediaUploaderProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Чистые функции обновления без сайд-эффектов
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
      updateFile(id, {
        status: "error",
        error: error instanceof Error ? error.message : "Сбой загрузки",
      });
    }
  };

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        alert(`Максимум ${maxFiles} файлов.`);
        return;
      }

      const validFiles = newFiles.filter((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`Файл ${file.name} имеет недопустимый формат.`);
          return false;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`Файл ${file.name} превышает ${maxSizeMB} МБ.`);
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
    [files.length, maxFiles, maxSizeMB],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* РЕНДЕР СКРЫТЫХ ИНПУТОВ ДЛЯ ФОРМЫ */}
      {files.map((f) => {
        if (f.status === "success" && f.key) {
          return (
            <input key={f.id} type="hidden" name="mediaKeys" value={f.key} />
          );
        }
        return null;
      })}

      <label
        className={cn(
          "bg-card/50 hover:bg-card group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/20 p-8 text-center transition-all",
          "focus-within:border-brand-secondary focus-within:ring-brand-secondary focus-within:ring-2",
          files.length >= maxFiles && "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="sr-only"
          disabled={files.length >= maxFiles}
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
        <UploadCloud className="text-muted-foreground group-hover:text-foreground mx-auto h-8 w-8 transition-colors" />
        <p className="text-sm font-medium">
          Загрузить фото или видео неисправности
        </p>
        <p className="text-muted-foreground text-xs">
          До {maxFiles} файлов (JPG, PNG, MP4, PDF). Макс. {maxSizeMB} МБ.
        </p>
      </label>

      {/* Список файлов остается без изменений */}
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
