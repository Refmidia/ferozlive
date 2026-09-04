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
    <div className="relative z-10 flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-black/45 backdrop-blur-md">
        <Monitor className="h-9 w-9 text-white/80" aria-hidden />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-3xl">
        Ninguém está compartilhando ainda
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
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
              className="rounded-xl border-white/25 bg-black/40 backdrop-blur-md"
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
