"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import "@/styles/livekit-theme.css";
import { VideoPresets } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSession } from "@/features/room/room-session";
import { useDisplayName } from "@/hooks/use-display-name";
import { apiFetch, ClientApiError } from "@/lib/http/client";
import type { JoinRoomResponse, RoomLookupResponse, TokenResponse } from "@/types/api";
import type { ParticipantRole, PublicRoomView } from "@/types/room";

export function RoomGate({ code }: { code: string }) {
  const router = useRouter();
  const { name, saveName, hydrated } = useDisplayName();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState<PublicRoomView | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [role, setRole] = useState<ParticipantRole>("guest");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const currentName = displayName || name;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<RoomLookupResponse>(`/api/rooms/${code}`);
        if (cancelled) return;
        if (result.room.status !== "active") {
          router.replace(`/room/${result.room.publicCode}/ended`);
          return;
        }
        setRoom(result.room);
        setNeedsPassword(result.room.hasPassword);
      } catch (error) {
        toast.error(error instanceof ClientApiError ? error.message : "Sala indisponível.");
        router.replace("/");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  async function connect() {
    const saved = saveName(currentName);
    setConnecting(true);
    try {
      const join = await apiFetch<JoinRoomResponse>("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({
          code,
          displayName: saved,
          password: password || undefined,
        }),
      });

      if (join.requiresPassword) {
        setNeedsPassword(true);
        toast.message("Esta sala está protegida por senha.");
        return;
      }

      const issued = await apiFetch<TokenResponse>("/api/livekit/token", {
        method: "POST",
        body: JSON.stringify({
          code,
          displayName: saved,
          password: password || undefined,
        }),
      });

      setRole(issued.role);
      setLivekitUrl(issued.livekitUrl);
      setToken(issued.token);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Não foi possível entrar.");
    } finally {
      setConnecting(false);
    }
  }

  if (loading || !hydrated) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (token && livekitUrl) {
    return (
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect
        audio={false}
        video={false}
        options={{
          adaptiveStream: true,
          dynacast: true,
          disconnectOnPageLeave: true,
          publishDefaults: {
            simulcast: true,
            dtx: true,
            screenShareEncoding: VideoPresets.h1080.encoding,
          },
        }}
        onError={() => toast.error("Falha na conexão de mídia. Tentando novamente...")}
      >
        <RoomSession
          code={room?.publicCode ?? code}
          role={role}
          hasPassword={Boolean(room?.hasPassword)}
        />
      </LiveKitRoom>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-5">
      <Card className="w-full p-6">
        <p className="text-sm text-[var(--sp-text-subtle)]">Entrar na sala</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--sp-text)]">{code}</h1>
        <label className="mt-6 block text-sm font-medium" htmlFor="gate-name">
          Seu nome
        </label>
        <Input
          id="gate-name"
          value={currentName}
          onChange={(event) => setDisplayName(event.target.value)}
          aria-label="Seu nome"
        />
        {needsPassword ? (
          <>
            <label className="mt-4 block text-sm font-medium" htmlFor="gate-password">
              Senha da sala
            </label>
            <Input
              id="gate-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Senha da sala"
            />
          </>
        ) : null}
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => void connect()}
          disabled={connecting}
        >
          {connecting ? "Conectando..." : "Entrar"}
        </Button>
      </Card>
    </section>
  );
}
