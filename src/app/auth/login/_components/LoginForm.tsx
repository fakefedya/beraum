"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/src/server/actions/auth";
import { FloatingField } from "@/src/components/shared/FloatingField";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/ui/icons";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
  });

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [lastState, setLastState] = useState(state);
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);

  if (state !== lastState) {
    setLastState(state);
    setIsErrorDismissed(false);
    if (state.isTwoFactor && !showTwoFactor) {
      setShowTwoFactor(true);
    } else if (!state.isTwoFactor && showTwoFactor) {
      setShowTwoFactor(false);
    }
  }

  const handleBack = () => {
    setShowTwoFactor(false);
    setIsErrorDismissed(true);
  };

  return (
    <div className="bg-card shadow-card w-full max-w-md rounded-[32px] p-8 md:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Icons.logo className="text-foreground h-6 w-auto" />
        <div>
          <h1 className="text-2xl font-semibold">Вход в систему</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Панель управления Beraum Store
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.error && !isErrorDismissed && (
          <div className="animate-in fade-in flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-950/50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{state.error}</p>
          </div>
        )}

        {!showTwoFactor ? (
          <div className="animate-in fade-in slide-in-from-left-4 flex flex-col gap-4">
            <FloatingField
              name="email"
              type="email"
              label="Корпоративный Email"
              defaultValue={state.payload?.email}
            />
            <FloatingField
              name="password"
              type="password"
              label="Пароль"
              defaultValue={state.payload?.password}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 flex flex-col gap-4">
            <input
              type="hidden"
              name="email"
              value={state.payload?.email || ""}
            />
            <input
              type="hidden"
              name="password"
              value={state.payload?.password || ""}
            />

            <div className="bg-brand/10 border-brand/20 flex flex-col gap-1 rounded-xl border p-4 text-center">
              <span className="text-foreground text-sm font-medium">
                Двухфакторная аутентификация
              </span>
              <span className="text-muted-foreground text-xs">
                Код отправлен на вашу почту
              </span>
            </div>

            <FloatingField
              name="code"
              type="text"
              label="Код подтверждения (6 цифр)"
              defaultValue={state.payload?.code}
            />

            <button
              type="button"
              disabled={isPending}
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground mt-2 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться назад
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand text-foreground hover:bg-brand-hover mt-4 h-12 w-full rounded-xl text-base font-semibold transition-all disabled:opacity-70"
        >
          {isPending ? "Обработка..." : showTwoFactor ? "Подтвердить" : "Войти"}
        </Button>
      </form>
    </div>
  );
};
