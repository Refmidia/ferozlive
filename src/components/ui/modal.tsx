"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Modal({
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[var(--sp-border)] bg-[var(--sp-surface-solid)] p-6 shadow-2xl">
        <h2 id="modal-title" className="text-xl font-semibold text-[var(--sp-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--sp-text-muted)]">{description}</p>
        {children}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
