import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full min-h-12 rounded-2xl border border-[var(--sp-border)] bg-[rgba(10,10,18,0.72)] px-4 text-[var(--sp-text)] placeholder:text-[var(--sp-text-subtle)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-focus)] ${className}`}
      {...props}
    />
  );
}
