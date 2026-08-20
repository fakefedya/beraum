"use client";

import { useSyncExternalStore } from "react";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Moscow", // МСК
  weekday: "short",
  hour: "numeric",
  hour12: false,
});

const listeners = new Set<() => void>();
let globalInterval: ReturnType<typeof setInterval> | null = null;

const subscribe = (callback: () => void) => {
  listeners.add(callback);

  if (!globalInterval) {
    globalInterval = setInterval(() => {
      listeners.forEach((listener) => listener());
    }, 60000);
  }

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && globalInterval) {
      clearInterval(globalInterval);
      globalInterval = null;
    }
  };
};

const checkIsOpen = (
  workDays: string[],
  startHour: number,
  endHour: number,
): boolean => {
  try {
    const parts = timeFormatter.formatToParts(new Date());
    const weekday = parts.find((p) => p.type === "weekday")?.value || "";
    const hour = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
      10,
    );

    return workDays.includes(weekday) && hour >= startHour && hour < endHour;
  } catch {
    return false;
  }
};

export function useSupportStatus(
  workDays = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour = 11,
  endHour = 19,
) {
  const getSnapshot = () => checkIsOpen(workDays, startHour, endHour);
  const getServerSnapshot = () => null;

  const isOpenSnapshot = useSyncExternalStore<boolean | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    isOpen: isOpenSnapshot === true,
    isMounted: isOpenSnapshot !== null,
  };
}
