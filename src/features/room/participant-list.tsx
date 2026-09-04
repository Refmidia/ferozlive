"use client";

import { Crown, Monitor, Mic, MicOff, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParticipantView } from "@/types/participant";

export function ParticipantList({
  participants,
  isHost,
  onKick,
  onStopShare,
}: {
  participants: ParticipantView[];
  isHost: boolean;
  onKick: (identity: string) => void;
  onStopShare: (identity: string) => void;
}) {
  return (
    <aside className="flex h-full flex-col rounded-3xl border border-[var(--sp-border)] bg-[var(--sp-surface)] p-4">
      <h2 className="text-sm font-medium text-[var(--sp-text)]">
        Participantes ({participants.length})
      </h2>
      <ul className="mt-4 space-y-2">
        {participants.map((participant) => (
          <li
            key={participant.identity}
            className="rounded-2xl border border-[var(--sp-border)] bg-[rgba(10,10,18,0.45)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--sp-text)]">{participant.displayName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--sp-text-muted)]">
                  {participant.role === "host" ? (
                    <span className="inline-flex items-center gap-1 text-[var(--sp-warning)]">
                      <Crown className="h-3.5 w-3.5" aria-hidden />
                      Anfitrião
                    </span>
                  ) : (
                    <span>Convidado</span>
                  )}
                  {participant.isSharing ? (
                    <span className="inline-flex items-center gap-1 text-[var(--sp-accent)]">
                      <Monitor className="h-3.5 w-3.5" aria-hidden />
                      Compartilhando
                    </span>
                  ) : null}
                </div>
              </div>
              {participant.micEnabled ? (
                <Mic className="h-4 w-4 text-[var(--sp-success)]" aria-label="Microfone ligado" />
              ) : (
                <MicOff className="h-4 w-4 text-[var(--sp-text-subtle)]" aria-label="Microfone desligado" />
              )}
            </div>
            {isHost && participant.role !== "host" ? (
              <div className="mt-3 flex gap-2">
                {participant.isSharing ? (
                  <Button
                    size="md"
                    variant="secondary"
                    className="min-h-10 flex-1 text-xs"
                    onClick={() => onStopShare(participant.identity)}
                  >
                    Interromper
                  </Button>
                ) : null}
                <Button
                  size="md"
                  variant="ghost"
                  className="min-h-10 flex-1 text-xs"
                  onClick={() => onKick(participant.identity)}
                  aria-label={`Remover ${participant.displayName}`}
                >
                  <UserMinus className="h-4 w-4" aria-hidden />
                  Remover
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
