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
import {
  Copy,
  Lock,
  LockOpen,
  MonitorUp,
  Pencil,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Modal } from "@/components/ui/modal";
import { ConnectionIndicator } from "@/features/room/connection-indicator";
import { IncompatibleBrowser } from "@/features/room/incompatible-browser";
import { ParticipantList } from "@/features/room/participant-list";
import {
  FloatingReactions,
  ROOM_REACTION_IDS,
  useReactionBurst,
  type RoomReactionId,
} from "@/features/room/floating-reactions";
import { RoomStage } from "@/features/room/room-stage";
import { RoomToolbar } from "@/features/room/room-toolbar";
import { RoomVoiceAudio } from "@/features/room/room-voice-audio";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDisplayName } from "@/hooks/use-display-name";
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
  hasPassword = false,
}: {
  code: string;
  role: ParticipantRole;
  hasPassword?: boolean;
}) {
  const router = useRouter();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const canShare = useScreenShareSupport();
  const { copy, copied } = useClipboard();
  const { name, saveName } = useDisplayName();
  const stageRef = useRef<HTMLDivElement>(null);
  const [quality] = useState<QualityPresetId>(DEFAULT_QUALITY);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [deafened, setDeafened] = useState(false);
  const [micDesired, setMicDesired] = useState(true);
  const [forceMuted, setForceMuted] = useState(false);
  const [hostMutedIdentities, setHostMutedIdentities] = useState<Set<string>>(() => new Set());
  const { reactions, burst } = useReactionBurst();
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

  const localView = views.find((participant) => participant.identity === localParticipant.identity);
  const displayName = localView?.displayName || name || "Convidado";
  const isSharing = localParticipant.isScreenShareEnabled;
  const someoneElseSharing = screenTracks.some(
    (track) => track.participant.identity !== localParticipant.identity && track.publication,
  );
  const someoneSharing = isSharing || someoneElseSharing;
  const micEnabled = localParticipant.isMicrophoneEnabled;

  useEffect(() => {
    void room.startAudio().catch(() => {
      // Browser may require a click first; toolbar actions will retry.
    });
  }, [room]);

  useEffect(() => {
    const desired = micDesired && !deafened && !forceMuted;
    if (localParticipant.isMicrophoneEnabled === desired) {
      return;
    }

    void localParticipant.setMicrophoneEnabled(desired).catch(() => {
      if (desired) {
        toast.error("Permissão de microfone negada ou indisponível.");
        setMicDesired(false);
      }
    });
  }, [localParticipant, micDesired, deafened, forceMuted]);

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      _participant?: { identity?: string },
      _kind?: unknown,
      topic?: string,
    ) => {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(payload)) as {
          type?: string;
          reactionId?: string;
          emoji?: string;
          identity?: string;
          muted?: boolean;
        };

        if (parsed.type === "force_mute" && typeof parsed.identity === "string") {
          const muted = Boolean(parsed.muted);
          setHostMutedIdentities((current) => {
            const next = new Set(current);
            if (muted) next.add(parsed.identity!);
            else next.delete(parsed.identity!);
            return next;
          });

          if (parsed.identity === localParticipant.identity) {
            setForceMuted(muted);
            if (muted) {
              setMicDesired(false);
              void localParticipant.setMicrophoneEnabled(false).catch(() => undefined);
              toast.message("O anfitrião mutou seu microfone.");
            } else {
              setMicDesired(true);
              void (async () => {
                try {
                  // Republish clears a leftover server mute, if any.
                  await localParticipant.setMicrophoneEnabled(false);
                  await localParticipant.setMicrophoneEnabled(true);
                  await room.startAudio();
                } catch {
                  // permission errors surface on next manual toggle
                }
              })();
              toast.success("O anfitrião liberou seu microfone.");
            }
          }
          return;
        }

        if (topic && topic !== "reaction" && topic !== "moderation") return;
        if (parsed.type !== "reaction") return;
        const reactionId = (parsed.reactionId ?? parsed.emoji) as RoomReactionId;
        if (!(ROOM_REACTION_IDS as readonly string[]).includes(reactionId)) return;
        burst(reactionId);
      } catch {
        // ignore malformed payloads
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, burst, localParticipant]);

  useEffect(() => {
    if (!forceMuted) return;
    if (!localParticipant.isMicrophoneEnabled) return;
    void localParticipant.setMicrophoneEnabled(false).catch(() => undefined);
  }, [forceMuted, localParticipant, localParticipant.isMicrophoneEnabled]);

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

  async function sendReaction(reactionId: RoomReactionId) {
    burst(reactionId);
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({ type: "reaction", reactionId }),
      );
      await localParticipant.publishData(payload, {
        reliable: false,
        topic: "reaction",
      });
    } catch {
      // local burst already shown
    }
  }

  async function toggleMic() {
    if (forceMuted) {
      toast.error("Você foi mutado pelo anfitrião. Só ele pode liberar seu microfone.");
      return;
    }

    if (deafened) {
      setDeafened(false);
      setMicDesired(true);
      void room.startAudio().catch(() => undefined);
      return;
    }

    const next = !micDesired;
    setMicDesired(next);
    void room.startAudio().catch(() => undefined);
  }

  async function toggleDeafen() {
    if (forceMuted && !deafened) {
      setDeafened(true);
      setMicDesired(false);
      toast.message("Áudio ensurdecido.");
      return;
    }

    const next = !deafened;
    setDeafened(next);
    if (next) {
      setMicDesired(false);
      toast.message("Áudio ensurdecido. Você não ouve ninguém e fica mutado.");
    } else if (!forceMuted) {
      setMicDesired(true);
      void room.startAudio().catch(() => undefined);
      toast.message("Áudio reativado.");
    } else {
      toast.message("Áudio reativado, mas o anfitrião ainda manteve seu microfone mutado.");
    }
  }

  async function broadcastForceMute(identity: string, muted: boolean) {
    setHostMutedIdentities((current) => {
      const next = new Set(current);
      if (muted) next.add(identity);
      else next.delete(identity);
      return next;
    });

    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({ type: "force_mute", identity, muted }),
      );
      await localParticipant.publishData(payload, {
        reliable: true,
        topic: "moderation",
      });
    } catch {
      // API already applied server mute
    }
  }

  async function handleAdmin(path: string, body?: Record<string, unknown>) {
    const isMuteAction = path.includes("/mute") && typeof body?.identity === "string";
    const muted = body?.muted !== false;

    try {
      await apiFetch(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : "{}",
      });
    } catch (error) {
      // Unmute is app-controlled; still unlock even if LiveKit unmute fails.
      if (!(isMuteAction && !muted)) {
        toast.error(error instanceof ClientApiError ? error.message : "Ação administrativa recusada.");
        return;
      }
    }

    if (isMuteAction && typeof body?.identity === "string") {
      await broadcastForceMute(body.identity, muted);
      toast.success(muted ? "Participante mutado." : "Participante desmutado.");
      return;
    }

    if (path.includes("/kick") && body?.ban) {
      toast.success("Participante banido da sala.");
    } else if (path.includes("/kick")) {
      toast.success("Participante expulso.");
    }
  }

  async function applyDisplayName() {
    const sanitized = saveName(draftName);
    if (!sanitized) {
      toast.error("Informe um nome válido.");
      return;
    }

    try {
      await localParticipant.setName(sanitized);
      const current = parseParticipantMetadata(localParticipant.metadata);
      await localParticipant.setMetadata(
        JSON.stringify({
          role: current?.role ?? role,
          displayName: sanitized,
        }),
      );
      setEditingName(false);
      toast.success("Nome atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o nome agora.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#07050c] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/8 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo compact />
          <span className="hidden h-7 w-px bg-white/15 sm:block" aria-hidden />
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="min-w-0 truncate text-sm font-medium text-white/90">
              {displayName}
            </p>
            <button
              type="button"
              onClick={() => {
                setDraftName(displayName);
                setEditingName(true);
              }}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9A8AAE] transition hover:bg-white/5 hover:text-white"
              aria-label="Editar nome"
              title="Editar nome"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() =>
              toast.message(
                hasPassword
                  ? "Esta sala está protegida por senha."
                  : "Esta sala está aberta. Crie com senha para trancar.",
              )
            }
            className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-[#C9B8D8] transition hover:bg-white/5 hover:text-white sm:inline-flex"
            aria-label={hasPassword ? "Sala trancada" : "Trancar sala"}
          >
            {hasPassword ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
            {hasPassword ? "Trancada" : "Trancar"}
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5 text-sm text-[#C9B8D8]">
            <Users className="h-4 w-4" aria-hidden />
            {participants.length}
          </span>
          <ConnectionIndicator />
          {role === "host" ? (
            <button
              type="button"
              onClick={() => setConfirmEnd(true)}
              className="hidden rounded-xl border border-[#FF4D6D]/40 px-3 py-1.5 text-sm text-[#FF8FA3] transition hover:bg-[#FF4D6D]/10 sm:inline-flex"
            >
              Encerrar
            </button>
          ) : null}
        </div>
      </header>

      {!canShare ? (
        <div className="px-4 pt-3 sm:px-5">
          <IncompatibleBrowser />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-white/8 bg-[#0a0710] lg:w-[300px] lg:border-b-0 lg:border-r">
          <div className="border-b border-white/8 px-3 py-3">
            <div className="room-code-shine relative overflow-hidden rounded-xl border px-3 py-2.5">
              <div className="relative z-10 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B7A9C]">
                  Código da sala
                </p>
                {hasPassword ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF8FBF]">
                    <Lock className="h-3 w-3" aria-hidden />
                    Protegida
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[#7E6E90]">Aberta</span>
                )}
              </div>
              <div className="relative z-10 mt-1.5 flex items-center gap-1.5">
                <p className="w-fit rounded-lg border border-dashed border-[#FF2D95]/45 bg-black/20 px-2.5 py-1.5 font-mono text-sm font-semibold tracking-[0.14em] text-white">
                  {code}
                </p>
                <button
                  type="button"
                  onClick={() => void copy(code, "code")}
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    copied === "code"
                      ? "bg-[#12301f] text-[#3DDC97]"
                      : "text-[#9A8AAE] hover:bg-white/5 hover:text-white"
                  }`}
                  aria-label="Copiar código"
                  title="Copiar código"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ParticipantList
              participants={views}
              localIdentity={localParticipant.identity}
              isHost={role === "host"}
              hostMutedIdentities={hostMutedIdentities}
              onKick={(identity) => void handleAdmin(`/api/rooms/${code}/kick`, { identity })}
              onMute={(identity) =>
                void handleAdmin(`/api/rooms/${code}/mute`, { identity, muted: true })
              }
              onUnmute={(identity) =>
                void handleAdmin(`/api/rooms/${code}/mute`, { identity, muted: false })
              }
              onStopShare={(identity) =>
                void handleAdmin(`/api/rooms/${code}/stop-share`, { identity })
              }
            />
          </div>

          <div className="mt-auto border-t border-white/8 p-4">
            <button
              type="button"
              onClick={() => void (isSharing ? stopOwnShare() : startShare(quality))}
              disabled={(!canShare && !isSharing) || someoneElseSharing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--sp-border)] px-3 py-2.5 text-sm text-[#E8D7F5] transition hover:border-[var(--sp-border-strong)] hover:bg-[var(--sp-primary-soft)] disabled:opacity-50"
            >
              <MonitorUp className="h-4 w-4 text-[#FF2D95]" aria-hidden />
              {isSharing ? "Parar de compartilhar" : "Compartilhar tela"}
            </button>
          </div>
        </aside>

        <main className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <RoomStage
              fullscreenRef={stageRef}
              canShare={canShare}
              localSharing={isSharing}
              displayName={displayName}
              isHost={role === "host"}
              speaking={Boolean(localView?.isSpeaking)}
              onShare={() => void startShare(quality)}
              onCopyLink={() => void copy(inviteUrl, "link")}
            />
            <FloatingReactions reactions={reactions} />
          </div>
          <RoomVoiceAudio muted={deafened} />
          <div className="shrink-0 border-t border-white/8 bg-[#07050c] px-3 py-3">
            <RoomToolbar
              sharing={isSharing}
              someoneSharing={someoneSharing}
            micEnabled={micEnabled && !forceMuted}
            deafened={deafened}
              speaking={Boolean(localView?.isSpeaking)}
              onToggleShare={() => void (isSharing ? stopOwnShare() : startShare(quality))}
              onToggleMic={() => void toggleMic()}
              onToggleDeafen={() => void toggleDeafen()}
              onReact={(reactionId) => void sendReaction(reactionId)}
              onFullscreen={() => {
                const node = stageRef.current;
                if (!node) return;
                if (document.fullscreenElement) {
                  void document.exitFullscreen();
                } else {
                  void node.requestFullscreen();
                }
              }}
              onLeave={() => {
                void room.disconnect();
                router.push("/");
              }}
            />
          </div>
        </main>
      </div>

      {editingName ? (
        <Modal
          title="Alterar nome"
          description="Esse nome aparece para a staff e para os outros na sala."
          confirmLabel="Salvar"
          onClose={() => setEditingName(false)}
          onConfirm={() => void applyDisplayName()}
        >
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="mt-4 w-full rounded-xl border border-[var(--sp-border)] bg-black/40 px-3 py-2.5 text-white outline-none focus:border-[var(--sp-border-strong)]"
            aria-label="Seu nome"
            maxLength={40}
          />
        </Modal>
      ) : null}

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
