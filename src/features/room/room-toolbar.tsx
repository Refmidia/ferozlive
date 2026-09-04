"use client";

import { LogOut, Maximize, MonitorUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScreenShareSupport } from "@/hooks/use-screen-share-support";

export function RoomToolbar({
  sharing,
  onToggleShare,
  onFullscreen,
  onLeave,
}: {
  sharing: boolean;
  onToggleShare: () => void;
  onFullscreen: () => void;
  onLeave: () => void;
}) {
  const canShare = useScreenShareSupport();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0c0812]/92 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <Button
          variant={sharing ? "secondary" : "primary"}
          onClick={onToggleShare}
          disabled={!canShare && !sharing}
          className={`rounded-xl ${
            sharing
              ? "border-white/15 bg-white/5"
              : "shadow-[0_0_24px_rgba(233,30,99,0.4)]"
          }`}
          aria-label={sharing ? "Parar compartilhamento" : "Compartilhar tela"}
        >
          {sharing ? (
            <Square className="h-4 w-4" aria-hidden />
          ) : (
            <MonitorUp className="h-4 w-4" aria-hidden />
          )}
          {sharing ? "Parar" : "Compartilhar tela"}
        </Button>
        <button
          type="button"
          onClick={onFullscreen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-transparent text-[#C9B8D8] transition hover:bg-white/5 hover:text-white"
          aria-label="Tela cheia"
        >
          <Maximize className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-transparent text-[#C9B8D8] transition hover:bg-white/5 hover:text-white"
          aria-label="Sair da sala"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
