"use client";

import { Link2, Monitor, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyStage({
  onShare,
  onCopyLink,
  canShare = true,
}: {
  onShare?: () => void;
  onCopyLink?: () => void;
  canShare?: boolean;
}) {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#15101f]">
        <Monitor className="h-9 w-9 text-[#7E6E90]" aria-hidden />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Ninguém está compartilhando ainda
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#9A8AAE]">
        Chame alguém com o link da sala ou comece transmitindo a sua tela.
      </p>
      {onShare || onCopyLink ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onShare ? (
            <Button
              onClick={onShare}
              disabled={!canShare}
              className="rounded-xl px-5 shadow-[0_0_28px_rgba(233,30,99,0.35)]"
              aria-label="Compartilhar tela"
            >
              <MonitorUp className="h-4 w-4" aria-hidden />
              Compartilhar tela
            </Button>
          ) : null}
          {onCopyLink ? (
            <Button
              variant="secondary"
              onClick={onCopyLink}
              className="rounded-xl border-[var(--sp-border-strong)] bg-transparent"
              aria-label="Copiar link"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              Copiar link
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
