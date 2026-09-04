"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoomEvent, Track } from "livekit-client";
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConnectionIndicator } from "@/features/room/connection-indicator";
import { IncompatibleBrowser } from "@/features/room/incompatible-browser";
import { ParticipantList } from "@/features/room/participant-list";
import { RoomStage } from "@/features/room/room-stage";
import { RoomToolbar } from "@/features/room/room-toolbar";
import { useClipboard } from "@/hooks/use-clipboard";
import { useScreenShareSupport } from "@/hooks/use-screen-share-support";
import { apiFetch, ClientApiError } from "@/lib/http/client";
import {
  buildPublishOptions,
  buildScreenShareOptions,
  nextQualityFallback,
} from "@/lib/livekit/screen-share";
import { parseParticipantMetadata } from "@/types/participant";
import type { ParticipantRole, QualityPresetId } from "@/types/room";
import { DEFAULT_QUALITY } from "@/config/quality";

export function RoomSession({
  code,
  role,
}: {
  code: string;
  role: ParticipantRole;
}) {
  const router = useRouter();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const canShare = useScreenShareSupport();
  const { copy, copied } = useClipboard();
  const stageRef = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<QualityPresetId>(DEFAULT_QUALITY);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const inviteUrl = typeof window === "undefined" ? "" : `${window.location.origin}/room/${code}`;

  const views = useMemo(
    () =>
      participants.map((participant) => {
        const metadata = parseParticipantMetadata(participant.metadata);
        return {
          identity: participant.identity,
          displayName: metadata?.displayName ?? participant.name ?? "Convidado",
          role: metadata?.role ?? (participant.identity.startsWith("host_") ? "host" : "guest"),
          isSpeaking: participant.isSpeaking,
          isSharing: participant.getTrackPublications().some(
            (publication) =>
              publication.source === Track.Source.ScreenShare && !publication.isMuted,
          ),
          micEnabled: participant.isMicrophoneEnabled,
        };
      }),
    [participants],
  );

  const isSharing = localParticipant.isScreenShareEnabled;
  const someoneElseSharing = screenTracks.some(
    (track) => track.participant.identity !== localParticipant.identity && track.publication,
  );

  useEffect(() => {
    const publication = localParticipant.getTrackPublication(Track.Source.ScreenShare);
    const media = publication?.track?.mediaStreamTrack;
    if (!media) {
      return;
    }

    const handleEnded = () => {
      void localParticipant.setScreenShareEnabled(false);
    };

    media.addEventListener("ended", handleEnded);
    return () => media.removeEventListener("ended", handleEnded);
  }, [localParticipant, isSharing]);

  useEffect(() => {
    const onDisconnected = () => {
      router.push(`/room/${code}/ended`);
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, router, code]);

  async function toggleMic() {
    try {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    } catch {
      toast.error("Permissão de microfone negada ou indisponível.");
    }
  }

  async function startShare(selectedQuality: QualityPresetId) {
    if (someoneElseSharing) {
      toast.error("Já existe um compartilhamento principal nesta sala.");
      return;
    }

    try {
      await localParticipant.setScreenShareEnabled(
        true,
        buildScreenShareOptions(selectedQuality),
        buildPublishOptions(selectedQuality),
      );
    } catch (error) {
      const fallback = nextQualityFallback(selectedQuality);
      if (fallback && fallback !== selectedQuality) {
        toast.message("A qualidade escolhida não foi suportada. Usando um fallback.");
        await startShare(fallback);
        return;
      }

      const message =
        error instanceof Error && /permission|denied|notallowed/i.test(error.message)
          ? "Permissão de tela negada."
          : "Não foi possível iniciar o compartilhamento.";
      toast.error(message);
    }
  }

  async function stopOwnShare() {
    await localParticipant.setScreenShareEnabled(false);
  }

  async function handleAdmin(path: string, body?: Record<string, unknown>) {
    try {
      await apiFetch(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : "{}",
      });
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Ação administrativa recusada.");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--sp-border)] bg-[var(--sp-surface)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--sp-text-subtle)]">Sala</p>
          <p className="text-xl font-semibold text-[var(--sp-text)]">{code}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ConnectionIndicator />
          <Button
            variant="secondary"
            onClick={() => void copy(code, "code")}
            aria-label="Copiar código da sala"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied === "code" ? "Código copiado" : "Copiar código"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void copy(inviteUrl, "link")}
            aria-label="Copiar link de convite"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            {copied === "link" ? "Link copiado" : "Copiar link"}
          </Button>
        </div>
      </header>

      {!canShare ? <IncompatibleBrowser /> : null}

      <div className={`grid flex-1 gap-4 ${participantsOpen ? "lg:grid-cols-[1fr_280px]" : ""}`}>
        <RoomStage fullscreenRef={stageRef} />
        {participantsOpen ? (
          <ParticipantList
            participants={views}
            isHost={role === "host"}
            onKick={(identity) => void handleAdmin(`/api/rooms/${code}/kick`, { identity })}
            onStopShare={(identity) =>
              void handleAdmin(`/api/rooms/${code}/stop-share`, { identity })
            }
          />
        ) : null}
      </div>

      <RoomToolbar
        micEnabled={localParticipant.isMicrophoneEnabled}
        sharing={isSharing}
        isHost={role === "host"}
        quality={quality}
        participantsOpen={participantsOpen}
        onToggleMic={() => void toggleMic()}
        onToggleShare={() => void (isSharing ? stopOwnShare() : startShare(quality))}
        onStopShare={() => void stopOwnShare()}
        onFullscreen={() => {
          const node = stageRef.current;
          if (!node) return;
          if (document.fullscreenElement) {
            void document.exitFullscreen();
          } else {
            void node.requestFullscreen();
          }
        }}
        onToggleParticipants={() => setParticipantsOpen((value) => !value)}
        onLeave={() => {
          void room.disconnect();
          router.push("/");
        }}
        onEndRoom={() => setConfirmEnd(true)}
        onQualityChange={setQuality}
      />

      {confirmEnd ? (
        <Modal
          title="Encerrar a sala para todos?"
          description="Todos os participantes serão desconectados e a sala deixará de aceitar novas entradas."
          confirmLabel="Encerrar sala"
          danger
          onClose={() => setConfirmEnd(false)}
          onConfirm={() => {
            setConfirmEnd(false);
            void handleAdmin(`/api/rooms/${code}/end`);
          }}
        />
      ) : null}
    </div>
  );
}
