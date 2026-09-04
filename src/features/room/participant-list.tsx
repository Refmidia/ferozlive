"use client";

import { Crown, Monitor, UserMinus } from "lucide-react";
import type { ParticipantView } from "@/types/participant";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ParticipantList({
  participants,
  localIdentity,
  isHost,
  onKick,
  onStopShare,
}: {
  participants: ParticipantView[];
  localIdentity?: string;
  isHost: boolean;
  onKick: (identity: string) => void;
  onStopShare: (identity: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E6E90]">
        Na sala — {participants.length}
      </p>
      <ul className="mt-3 space-y-2">
        {participants.map((participant) => {
          const isYou = participant.identity === localIdentity;
          return (
            <li
              key={participant.identity}
              className="flex items-center gap-3 rounded-xl px-1 py-1.5"
            >
              <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E63] to-[#7B1FA2] text-sm font-semibold text-white">
                {initials(participant.displayName)}
                {participant.role === "host" ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F5C16C] text-black">
                    <Crown className="h-2.5 w-2.5" aria-hidden />
                  </span>
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {participant.displayName}
                  </p>
                  {isYou ? (
                    <span className="rounded-md bg-[var(--sp-primary-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF2D95]">
                      Você
                    </span>
                  ) : null}
                </div>
                {participant.isSharing ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#FF2D95]">
                    <Monitor className="h-3 w-3" aria-hidden />
                    Compartilhando
                  </p>
                ) : null}
              </div>
              {isHost && participant.role !== "host" ? (
                <div className="flex shrink-0 gap-1">
                  {participant.isSharing ? (
                    <button
                      type="button"
                      onClick={() => onStopShare(participant.identity)}
                      className="rounded-lg px-2 py-1 text-[11px] text-[#B8A8C9] hover:bg-white/5 hover:text-white"
                    >
                      Parar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onKick(participant.identity)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#B8A8C9] hover:bg-white/5 hover:text-white"
                    aria-label={`Remover ${participant.displayName}`}
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
