"use client";

import { useCallback, useEffect, useState } from "react";

type SetValue<T> = T | ((currentValue: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValueState] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValueState(JSON.parse(stored) as T);
      }
    } catch {
      setValueState(initialValue);
    } finally {
      setIsReady(true);
    }
  }, [initialValue, key]);

  const setValue = useCallback(
    (nextValue: SetValue<T>) => {
      setValueState((currentValue) => {
        const resolvedValue =
          nextValue instanceof Function ? nextValue(currentValue) : nextValue;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        }

        return resolvedValue;
      });
    },
    [key]
  );

  return { value, setValue, isReady };
}
