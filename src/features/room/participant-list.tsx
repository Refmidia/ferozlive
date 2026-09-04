"use client";

import { Crown, Mic, MicOff, Monitor, MonitorOff, UserX } from "lucide-react";
import type { ParticipantView } from "@/types/participant";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function ParticipantRow({
  participant,
  isYou,
  isHost,
  highlighted = false,
  hostMuted,
  onKick,
  onMute,
  onUnmute,
  onStopShare,
}: {
  participant: ParticipantView;
  isYou: boolean;
  isHost: boolean;
  highlighted?: boolean;
  hostMuted: boolean;
  onKick: (identity: string) => void;
  onMute: (identity: string) => void;
  onUnmute: (identity: string) => void;
  onStopShare: (identity: string) => void;
}) {
  const silenced = hostMuted || !participant.micEnabled;

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl px-2.5 py-2.5 ${
        highlighted ? "border border-white/8 bg-[#14101c]" : "px-1"
      }`}
    >
      <span
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E63] to-[#7B1FA2] text-sm font-semibold text-white transition ${
          participant.isSpeaking
            ? "ring-2 ring-[#3DDC97] ring-offset-2 ring-offset-[#0a0710] shadow-[0_0_16px_rgba(61,220,151,0.45)]"
            : ""
        }`}
      >
        {initials(participant.displayName)}
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#14101c] ${
            participant.isSpeaking
              ? "animate-pulse bg-[#3DDC97]"
              : silenced
                ? "bg-[#FF4D6D]"
                : "bg-[#3DDC97]/70"
          }`}
          aria-hidden
        />
        {participant.role === "host" && !highlighted ? (
          <span className="absolute -left-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F5C16C] text-black">
            <Crown className="h-2.5 w-2.5" aria-hidden />
          </span>
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-white">{participant.displayName}</p>
          {participant.role === "host" ? (
            <Crown className="h-3.5 w-3.5 text-[#F5C16C]" aria-label="Anfitrião" />
          ) : null}
          {isYou ? (
            <span className="rounded-md bg-[var(--sp-primary-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF2D95]">
              Você
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#9A8AAE]">
          {participant.isSharing ? <span className="text-[#FF8FBF]">Compartilhando tela</span> : null}
          <span className="inline-flex items-center gap-1" title={silenced ? "Mutado" : "No microfone"}>
            {silenced ? (
              <MicOff className="h-3.5 w-3.5 text-[#FF6B8A]" strokeWidth={2.4} aria-hidden />
            ) : (
              <Mic
                className={`h-3.5 w-3.5 ${participant.isSpeaking ? "text-[#3DDC97]" : "text-[#9A8AAE]"}`}
                strokeWidth={2.2}
                aria-hidden
              />
            )}
            {participant.isSpeaking && !silenced
              ? "Falando"
              : participant.isSharing
                ? null
                : silenced
                  ? "Mutado"
                  : null}
          </span>
        </div>
      </div>
      {participant.isSharing ? (
        <Monitor className="h-4 w-4 shrink-0 text-[#FF2D95]" aria-hidden />
      ) : null}
      {isHost && participant.role !== "host" && !isYou ? (
        <div className="flex shrink-0 items-center gap-1">
          {hostMuted ? (
            <button
              type="button"
              onClick={() => onUnmute(participant.identity)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3DDC97]/40 bg-[#12301f]/80 text-[#3DDC97] shadow-[0_0_12px_rgba(61,220,151,0.2)] transition hover:bg-[#164028] hover:text-[#6EF0B0]"
              aria-label={`Desmutar ${participant.displayName}`}
              title="Desmutar"
            >
              <Mic className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMute(participant.identity)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#C9B8D8] transition hover:border-[#FF8FA3]/45 hover:bg-[#FF4D6D]/12 hover:text-[#FF8FA3]"
              aria-label={`Mutar ${participant.displayName}`}
              title="Mutar"
            >
              <MicOff className="h-4 w-4" strokeWidth={2.25} />
            </button>
          )}
          {participant.isSharing ? (
            <button
              type="button"
              onClick={() => onStopShare(participant.identity)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#C9B8D8] transition hover:bg-white/5 hover:text-white"
              aria-label={`Parar compartilhamento de ${participant.displayName}`}
              title="Parar tela"
            >
              <MonitorOff className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onKick(participant.identity)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#C9B8D8] transition hover:border-[#FF4D6D]/45 hover:bg-[#FF4D6D]/12 hover:text-[#FF8FA3]"
            aria-label={`Expulsar ${participant.displayName}`}
            title="Expulsar da sala"
          >
            <UserX className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function ParticipantList({
  participants,
  localIdentity,
  isHost,
  hostMutedIdentities,
  onKick,
  onMute,
  onUnmute,
  onStopShare,
}: {
  participants: ParticipantView[];
  localIdentity?: string;
  isHost: boolean;
  hostMutedIdentities: Set<string>;
  onKick: (identity: string) => void;
  onMute: (identity: string) => void;
  onUnmute: (identity: string) => void;
  onStopShare: (identity: string) => void;
}) {
  const sharing = participants.filter((participant) => participant.isSharing);
  const waiting = participants.filter((participant) => !participant.isSharing);
  const hasShare = sharing.length > 0;

  return (
    <div className="space-y-5">
      {hasShare ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E6E90]">
            Transmitindo — {sharing.length}
          </p>
          <ul className="mt-3 space-y-2">
            {sharing.map((participant) => (
              <ParticipantRow
                key={participant.identity}
                participant={participant}
                isYou={participant.identity === localIdentity}
                isHost={isHost}
                highlighted
                hostMuted={hostMutedIdentities.has(participant.identity)}
                onKick={onKick}
                onMute={onMute}
                onUnmute={onUnmute}
                onStopShare={onStopShare}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E6E90]">
          Na sala — {waiting.length}
        </p>
        {waiting.length === 0 && hasShare ? (
          <p className="mt-3 text-sm text-[#6F5F82]">Todo mundo está transmitindo.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {waiting.map((participant) => (
              <ParticipantRow
                key={participant.identity}
                participant={participant}
                isYou={participant.identity === localIdentity}
                isHost={isHost}
                hostMuted={hostMutedIdentities.has(participant.identity)}
                onKick={onKick}
                onMute={onMute}
                onUnmute={onUnmute}
                onStopShare={onStopShare}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
