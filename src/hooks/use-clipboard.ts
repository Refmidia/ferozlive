"use client";

import { useCallback, useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (value: string, key = value) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => {
      setCopied((current) => (current === key ? null : current));
    }, 1800);
  }, []);

  return { copy, copied };
}
