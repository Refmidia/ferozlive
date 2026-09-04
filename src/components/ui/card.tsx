import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-[var(--sp-border)] bg-[var(--sp-surface)] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    />
  );
}
