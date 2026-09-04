"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DISPLAY_NAME_STORAGE_KEY } from "@/config/limits";
import { sanitizeDisplayName } from "@/lib/validation/sanitize";

const NAME_EVENT = "screenparty-name";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(NAME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(NAME_EVENT, callback);
  };
}

function getSnapshot() {
  return sanitizeDisplayName(window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) ?? "");
}

export function useDisplayName() {
  const name = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const saveName = useCallback((value: string) => {
    const sanitized = sanitizeDisplayName(value);
    if (sanitized) {
      window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, sanitized);
    } else {
      window.localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(NAME_EVENT));
    return sanitized;
  }, []);

  return { name, saveName, hydrated: true };
}
