"use client";

import {
  LogOut,
  Maximize,
  MonitorOff,
  MonitorUp,
} from "lucide-react";
import Image from "next/image";
import { useScreenShareSupport } from "@/hooks/use-screen-share-support";
import {
  ROOM_REACTIONS,
  type RoomReactionId,
} from "@/features/room/floating-reactions";
import { MicControl } from "@/features/room/mic-control";
import { SpeakerControl } from "@/features/room/speaker-control";

function IconButton({
  active,
  danger,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  danger?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
        danger
          ? "bg-[#FF4D6D]/15 text-[#FF8FA3] hover:bg-[#FF4D6D]/25"
          : active
            ? "bg-[var(--sp-primary-soft)] text-[#FF2D95] hover:bg-[rgba(233,30,99,0.28)]"
            : "text-[#C9B8D8] hover:bg-white/8 hover:text-white"
      }`}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function AudioControls({
  micEnabled,
  deafened,
  speaking,
  onToggleMic,
  onToggleDeafen,
}: {
  micEnabled: boolean;
  deafened: boolean;
  speaking: boolean;
  onToggleMic: () => void;
  onToggleDeafen: () => void;
}) {
  return (
    <>
      <MicControl
        micEnabled={micEnabled}
        deafened={deafened}
        speaking={speaking}
        onToggleMic={onToggleMic}
      />
      <SpeakerControl deafened={deafened} onToggleDeafen={onToggleDeafen} />
    </>
  );
}

export function RoomToolbar({
  sharing,
  someoneSharing,
  micEnabled,
  deafened,
  speaking,
  onToggleShare,
  onToggleMic,
  onToggleDeafen,
  onFullscreen,
  onLeave,
  onReact,
}: {
  sharing: boolean;
  someoneSharing: boolean;
  micEnabled: boolean;
  deafened: boolean;
  speaking: boolean;
  onToggleShare: () => void;
  onToggleMic: () => void;
  onToggleDeafen: () => void;
  onFullscreen: () => void;
  onLeave: () => void;
  onReact: (emoji: RoomReactionId) => void;
}) {
  const canShare = useScreenShareSupport();
  const showReactions = sharing || someoneSharing;

  return (
    <div className="flex w-full justify-center">
      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-[#10131a]/95 px-2 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:gap-2 sm:px-3">
        <AudioControls
          micEnabled={micEnabled}
          deafened={deafened}
          speaking={speaking}
          onToggleMic={onToggleMic}
          onToggleDeafen={onToggleDeafen}
        />

        <span className="mx-1 hidden h-7 w-px bg-white/12 sm:block" aria-hidden />

        {sharing ? (
          <button
            type="button"
            onClick={onToggleShare}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E53935] px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(229,57,53,0.45)] transition hover:bg-[#F44336]"
            aria-label="Parar de compartilhar"
          >
            <MonitorOff className="h-4 w-4" aria-hidden />
            Parar de compartilhar
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleShare}
            disabled={!canShare || someoneSharing}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#FF2D95] to-[#C2185B] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(233,30,99,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Compartilhar tela"
          >
            <MonitorUp className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Compartilhar tela</span>
            <span className="sm:hidden">Tela</span>
          </button>
        )}

        {showReactions ? (
          <>
            <span className="mx-1 hidden h-7 w-px bg-white/12 sm:block" aria-hidden />
            <div className="flex items-center gap-0.5 px-1">
              {ROOM_REACTIONS.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  onClick={() => onReact(reaction.id)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-110 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2D95] active:scale-95"
                  aria-label={`Reagir com ${reaction.label}`}
                  title={reaction.label}
                >
                  <Image
                    src={reaction.src}
                    alt={reaction.label}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}

        <span className="mx-1 hidden h-7 w-px bg-white/12 sm:block" aria-hidden />

        <IconButton label="Tela cheia" onClick={onFullscreen}>
          <Maximize className="h-5 w-5" />
        </IconButton>

        <span className="hidden h-7 w-px bg-white/12 sm:block" aria-hidden />

        <IconButton label="Sair da sala" onClick={onLeave}>
          <LogOut className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}
