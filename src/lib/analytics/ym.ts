import { clientEnv } from "@/src/lib/env/client";

export type YmGoal = {
  name: "view_item";
  params: {
    article: string;
    category_slug?: string;
    category_name?: string;
  };
};

declare global {
  interface Window {
    ym?: (
      counterId: number,
      eventName: "init" | "hit" | "reachGoal" | "params",
      target?: string | Record<string, unknown>,
      params?: Record<string, unknown>,
    ) => void;
  }
}

const COUNTER_ID = clientEnv.NEXT_PUBLIC_YM_COUNTER_ID
  ? Number(clientEnv.NEXT_PUBLIC_YM_COUNTER_ID)
  : null;

export function reachYmGoal<T extends YmGoal>(
  name: T["name"],
  params?: T["params"],
) {
  if (
    typeof window === "undefined" ||
    !COUNTER_ID ||
    typeof window.ym !== "function"
  ) {
    return;
  }

  try {
    window.ym(COUNTER_ID, "reachGoal", name, params);
  } catch (error) {
    console.error("[YM Error] Failed to reach goal:", name, error);
  }
}

export function hitYm(url: string) {
  if (
    typeof window === "undefined" ||
    !COUNTER_ID ||
    typeof window.ym !== "function"
  ) {
    return;
  }

  try {
    window.ym(COUNTER_ID, "hit", url);
  } catch (error) {
    console.error("[YM Error] Failed to send hit:", url, error);
  }
}
