"use client";

import { useState, useActionState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { Checkbox } from "@/src/components/ui/checkbox";
import { submitConsultAction } from "@/src/server/actions/feedback";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

const ConsultFormContent = ({ onClose }: { onClose: () => void }) => {
  const pathname = usePathname();
  const [state, formAction, isPending] = useActionState(submitConsultAction, {
    success: false,
  });

  if (state.success) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h4 className="mb-2 text-xl font-medium">Ваш вопрос отправлен!</h4>
        <p className="text-muted-foreground text-sm">
          Наш специалист свяжется с вами в ближайшее время.
        </p>
        <Button
          className={cn(
            "bg-card text-foreground mt-8 h-12 w-full rounded-xl",
            "transition-colors duration-300 hover:bg-gray-200",
          )}
          onClick={onClose}
        >
          Закрыть
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex h-full flex-col gap-4" noValidate>
      <input type="hidden" name="sourcePage" value={pathname} />

      {state.error && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      <div className="bg-card text-foreground flex items-start gap-3 rounded-2xl p-4">
        <Info className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          Если вы хотите сообщить о неисправности —{" "}
          <Link
            href="/support"
            onClick={onClose}
            className="text-brand-secondary-muted hover:text-brand-secondary font-medium transition-colors"
          >
            создайте обращение
          </Link>{" "}
          в поддержку.
        </p>
      </div>

      <FloatingField
        name="name"
        label="Имя"
        disabled={isPending}
        error={state.fieldErrors?.name}
        defaultValue={state.payload?.name as string}
      />
      <FloatingField
        name="phone"
        label="Телефон"
        type="tel"
        disabled={isPending}
        error={state.fieldErrors?.phone}
        defaultValue={state.payload?.phone as string}
      />
      <FloatingField
        name="email"
        label="Электронная почта"
        type="email"
        disabled={isPending}
        error={state.fieldErrors?.email}
        defaultValue={state.payload?.email as string}
      />
      <FloatingField
        name="message"
        label="Ваш вопрос"
        isTextarea
        disabled={isPending}
        error={state.fieldErrors?.message}
        defaultValue={state.payload?.message as string}
      />

      <div className={cn("mt-auto flex flex-col gap-5", "md:mt-2")}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="consult-consent"
              name="consent"
              value="on"
              disabled={isPending}
              defaultChecked={state.payload?.consent === "on"}
              className="shrink-0"
            />
            <label
              htmlFor="consult-consent"
              className="text-foreground/80 cursor-pointer text-xs"
            >
              Я даю согласие на{" "}
              <a
                href="/policies/consent"
                target="_blank"
                className="text-brand-secondary-muted hover:text-brand-secondary transition-colors"
              >
                обработку персональных данных
              </a>
            </label>
          </div>
          {state.fieldErrors?.consent && (
            <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{state.fieldErrors.consent}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-secondary text-foreground hover:bg-brand-secondary/80 h-12 w-full rounded-xl text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Отправка..." : "Отправить вопрос"}
        </Button>
      </div>
    </form>
  );
};

export const ConsultWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setSessionKey((prev) => prev + 1);
    }
    setIsOpen(!isOpen);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <div
          className={cn(
            "bg-background/80 animate-in fade-in fixed inset-0 z-60 backdrop-blur-sm",
            "sm:hidden",
          )}
          onClick={handleClose}
        />
      )}

      <div
        className={cn(
          "pointer-events-none fixed z-70 flex flex-col items-end gap-4",
          "right-4 bottom-4",
          isOpen && "pointer-events-after",
        )}
      >
        <div
          className={cn(
            "bg-background flex origin-bottom-right flex-col transition-all duration-300",
            "sm:shadow-card fixed inset-0 h-dvh w-full sm:static sm:h-auto sm:w-100 sm:rounded-3xl sm:border sm:border-black/5",
            isOpen
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-90 opacity-0 sm:scale-75",
          )}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-lg font-medium">Задать вопрос</h3>
            <Button
              className={cn(
                "bg-card h-10 w-10 rounded-full",
                "transition-colors duration-300 hover:bg-gray-200",
              )}
              onClick={handleClose}
            >
              <X strokeWidth={2} size={18} className="text-foreground" />
            </Button>
          </div>

          <div className="flex-1 scrollbar-thin overflow-y-auto p-6">
            <ConsultFormContent key={sessionKey} onClose={handleClose} />
          </div>
        </div>

        <Button
          onClick={handleToggle}
          className={cn(
            "pointer-events-auto h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300",
            "bg-foreground text-background backdrop-blur-xl backdrop-saturate-150",
            "hover:bg-foreground/80",
            isOpen &&
              "sm:bg-brand sm:hover:bg-brand/80 sm:text-foreground scale-0 opacity-0 sm:scale-100 sm:opacity-100",
          )}
          aria-label={isOpen ? "Закрыть" : "Задать вопрос"}
        >
          {isOpen ? (
            <X strokeWidth={2} className="hidden sm:block" />
          ) : (
            <MessageSquare strokeWidth={2} size={20} />
          )}
        </Button>
      </div>
    </>
  );
};
