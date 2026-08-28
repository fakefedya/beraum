"use client";

import { useEffect, useState } from "react";
import { getMediaUrlsAction } from "@/src/server/actions/requests";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Loader2, ExternalLink, FileIcon } from "lucide-react";
import { SafeImage } from "@/src/components/shared/SafeImage";
import type { RequestItem, FeedbackPayload } from "./RequestsTable";

interface RequestDetailsProps {
  request: RequestItem | null;
  categories: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
}

// 🛡️ Arch: Словарь для русификации полей Payload
const PAYLOAD_LABELS: Record<string, string> = {
  address: "Адрес",
  deviceCondition: "Тип техники",
  categoryId: "Категория",
  modelArticle: "Артикул / Модель",
  purchaseDate: "Дата покупки",
  marketplace: "Место покупки",
  sourcePage: "Страница обращения",
  topic: "Тема вопроса",
  companyName: "Название компании",
  inn: "ИНН",
  volume: "Ожидаемый объем",
  source: "Источник перехода",
};

export const RequestDetailsSheet = ({
  request,
  categories,
  isOpen,
  onClose,
}: RequestDetailsProps) => {
  const [mediaUrls, setMediaUrls] = useState<{ key: string; url: string }[]>(
    [],
  );
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const safeRequestId = request?.id ?? null;
  const payload = (request?.payload || {}) as FeedbackPayload;
  const hasMedia =
    Array.isArray(payload.mediaKeys) && payload.mediaKeys.length > 0;

  if (safeRequestId !== currentRequestId) {
    setCurrentRequestId(safeRequestId);
    setMediaUrls([]);
    setIsLoadingMedia(hasMedia);
  }

  useEffect(() => {
    if (!isOpen || !hasMedia || !payload.mediaKeys) return;
    let isMounted = true;

    getMediaUrlsAction(payload.mediaKeys)
      .then((urls) => {
        if (isMounted) {
          setMediaUrls(urls);
          setIsLoadingMedia(false);
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки медиа:", err);
        if (isMounted) setIsLoadingMedia(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, safeRequestId, hasMedia]);

  if (!request) return null;

  const renderPayloadValue = (key: string, value: unknown) => {
    if (!value) return "—";

    if (key === "categoryId") {
      const cat = categories.find((c) => c.id === value);
      return cat ? cat.name : "Неизвестная категория";
    }

    if (key === "purchaseDate" && typeof value === "string") {
      try {
        return new Intl.DateTimeFormat("ru-RU").format(new Date(value));
      } catch {
        return value;
      }
    }

    // 1. Маппинг типа техники (обрабатываем и старые, и новые ключи схемы)
    if (key === "deviceCondition" || key === "techType") {
      const conditionMap: Record<string, string> = {
        new: "Новая",
        discount: "Дисконт",
        // Поддержка legacy-данных (если в БД остались старые заявки)
        working: "Исправная уценка (Спб)",
        broken: "Неисправная техника (Мск/Спб)",
      };
      return conditionMap[String(value)] || String(value);
    }

    // 2. Маппинг маркетплейсов по внутренним константам
    if (key === "marketplace" || key === "purchasePlace") {
      const marketplaceMap: Record<string, string> = {
        ozon: "Ozon",
        wb: "Wildberries",
        ymarket: "Яндекс Маркет",
        mvideo: "М.Видео",
      };
      return marketplaceMap[String(value)] || String(value);
    }

    // Маппинг источников
    if (key === "source" && value === "discount_page") {
      return "Страница дисконта (Опт)";
    }
    if (key === "sourcePage" && value === "/") {
      return "Главная страница";
    }

    return String(value);
  };

  // Фильтруем системные ключи, которые не нужно выводить в цикле
  const specificEntries = Object.entries(payload).filter(
    ([k]) => k !== "mediaKeys",
  );

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="border-border/50 bg-background/95 w-full overflow-y-auto border-l backdrop-blur-xl sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Детали заявки</SheetTitle>
          <div className="text-muted-foreground text-sm">
            {new Intl.DateTimeFormat("ru-RU", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(request.createdAt))}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Контакты
            </h4>
            <div className="bg-muted/30 flex flex-col gap-1 rounded-xl p-4">
              <span className="text-foreground font-medium">
                {request.name}
              </span>
              <a
                href={`mailto:${request.email}`}
                className="text-blue-500 hover:underline"
              >
                {request.email}
              </a>
              <a
                href={`tel:${request.phone}`}
                className="text-foreground hover:underline"
              >
                {request.phone}
              </a>
            </div>
          </section>

          {/* 🛡️ Dynamic Rendering: Отображает абсолютно все доступные поля из Payload */}
          {specificEntries.length > 0 && (
            <section className="flex flex-col gap-3">
              <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Специфика
              </h4>
              <div className="bg-muted/30 flex flex-col gap-3 rounded-xl p-4 text-sm">
                {specificEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="border-border/50 flex justify-between gap-4 border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {PAYLOAD_LABELS[key] || key}:
                    </span>
                    <span className="text-right font-medium break-all">
                      {renderPayloadValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Сообщение
            </h4>
            <div className="bg-muted/30 rounded-xl p-4 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {request.message || (
                <span className="text-muted-foreground italic">
                  Без сообщения
                </span>
              )}
            </div>
          </section>

          {hasMedia && (
            <section className="flex flex-col gap-3">
              <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Вложения
              </h4>
              {isLoadingMedia ? (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Генерация
                  ссылок...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {mediaUrls.map((media, idx) => {
                    const isImage = media.key.match(
                      /\.(jpg|jpeg|png|webp|heic)$/i,
                    );
                    return (
                      <a
                        key={idx}
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-card hover:border-foreground relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors"
                      >
                        {isImage ? (
                          <SafeImage
                            src={media.url}
                            alt="Вложение"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <FileIcon className="text-muted-foreground group-hover:text-foreground h-8 w-8 transition-colors" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                          <ExternalLink className="text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
