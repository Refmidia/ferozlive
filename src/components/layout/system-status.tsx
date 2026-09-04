"use client";

import { useEffect, useState } from "react";

export function SystemStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    void fetch("/api/health")
      .then((response) => response.json())
      .then((data: { ok?: boolean }) => setOnline(Boolean(data.ok)))
      .catch(() => setOnline(false));
  }, []);

  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
        online
          ? "border-[#7CFF2E]/70 bg-[#123000] text-[#A2FF00]"
          : "border-[var(--sp-danger)]/50 bg-[#2A0A10] text-[var(--sp-danger)]"
      }`}
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${online ? "bg-[#A2FF00]" : "bg-[var(--sp-danger)]"}`}
        aria-hidden
      />
      {online ? "Sistema operacional" : "Sistema instável"}
    </p>
  );
}
