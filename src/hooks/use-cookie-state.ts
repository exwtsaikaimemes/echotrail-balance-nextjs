"use client";

import { useState, useCallback } from "react";

function readCookie<T>(key: string, defaultValue: T): T {
  if (typeof document === "undefined") return defaultValue;
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  if (!match) return defaultValue;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as T;
  } catch {
    return defaultValue;
  }
}

function writeCookie(key: string, value: unknown): void {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${key}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
}

export function useCookieState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readCookie(key, defaultValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        writeCookie(key, next);
        return next;
      });
    },
    [key],
  );

  return [state, setValue];
}
