"use client";

import {
  Mic,
  MicOff,
  MonitorUp,
  Square,
  Maximize,
  Users,
  LogOut,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QualitySelect } from "@/features/room/quality-select";
import { useScreenShareSupport } from "@/hooks/use-screen-share-support";
import type { QualityPresetId } from "@/types/room";

export function RoomToolbar({
  micEnabled,
  sharing,
  isHost,
  quality,
  participantsOpen,
  onToggleMic,
  onToggleShare,
  onStopShare,
  onFullscreen,
  onToggleParticipants,
  onLeave,
  onEndRoom,
  onQualityChange,
}: {
  micEnabled: boolean;
  sharing: boolean;
  isHost: boolean;
  quality: QualityPresetId;
  participantsOpen: boolean;
  onToggleMic: () => void;
  onToggleShare: () => void;
  onStopShare: () => void;
  onFullscreen: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
  onEndRoom: () => void;
  onQualityChange: (value: QualityPresetId) => void;
}) {
  const canShare = useScreenShareSupport();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--sp-border)] bg-[var(--sp-surface)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={micEnabled ? "primary" : "secondary"}
          size="icon"
          onClick={onToggleMic}
          aria-label={micEnabled ? "Desligar microfone" : "Ligar microfone"}
        >
          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant={sharing ? "secondary" : "primary"}
          onClick={onToggleShare}
          disabled={!canShare && !sharing}
          aria-label={sharing ? "Parar compartilhamento" : "Compartilhar tela"}
        >
          <MonitorUp className="h-5 w-5" aria-hidden />
          {sharing ? "Parar compartilhamento" : "Compartilhar tela"}
        </Button>
        {sharing ? (
          <Button variant="ghost" onClick={onStopShare} aria-label="Parar compartilhamento">
            <Square className="h-4 w-4" aria-hidden />
            Parar
          </Button>
        ) : null}
        <Button variant="secondary" size="icon" onClick={onFullscreen} aria-label="Tela cheia">
          <Maximize className="h-5 w-5" />
        </Button>
        <QualitySelect value={quality} onChange={onQualityChange} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={onToggleParticipants}
          aria-label={participantsOpen ? "Fechar participantes" : "Abrir participantes"}
        >
          <Users className="h-5 w-5" aria-hidden />
          Participantes
        </Button>
        {isHost ? (
          <Button variant="danger" onClick={onEndRoom} aria-label="Encerrar sala">
            <ShieldOff className="h-5 w-5" aria-hidden />
            Encerrar sala
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onLeave} aria-label="Sair da sala">
          <LogOut className="h-5 w-5" aria-hidden />
          Sair
        </Button>
      </div>
    </div>
  );
}
