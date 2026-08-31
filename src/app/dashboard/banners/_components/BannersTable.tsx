"use client";

import type { slides } from "@/src/server/db/schema";
import { BannerRow } from "./BannerRow";

type SlideItem = typeof slides.$inferSelect;

export const BannersTable = ({ initialData }: { initialData: SlideItem[] }) => {
  if (!initialData.length) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Баннеры не найдены.
      </div>
    );
  }

  return (
    <table className="bg-muted w-full text-left text-sm">
      <thead className="text-muted-foreground border-b text-xs uppercase">
        <tr>
          <th className="w-32 px-4 py-3 font-medium">Превью</th>
          <th className="px-4 py-3 font-medium">Идентификатор / Место</th>
          <th className="px-4 py-3 font-medium">Конфигурация</th>
          <th className="w-24 px-4 py-3 font-medium">Сортировка</th>
          <th className="w-32 px-4 py-3 font-medium">Статус</th>
          <th className="w-32 px-4 py-3 font-medium">Действия</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {initialData.map((slide) => (
          <BannerRow key={slide.id} slide={slide} />
        ))}
      </tbody>
    </table>
  );
};
