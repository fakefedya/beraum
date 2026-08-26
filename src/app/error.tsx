"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Store Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-semibold md:text-3xl">
        Что-то пошло не так!
      </h2>
      <p className="text-muted-foreground mt-4 max-w-md">
        При загрузке страницы произошла непредвиденная ошибка. Мы уже получили
        уведомление и работаем над исправлением.
      </p>
      <Button
        onClick={() => reset()}
        className="mt-8 h-12 rounded-[16px] px-8 text-base font-medium"
      >
        Попробовать снова
      </Button>
    </div>
  );
}
