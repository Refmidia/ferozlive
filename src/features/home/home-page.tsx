"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Lock, Users, TriangleAlert } from "lucide-react";
import { brand } from "@/config/brand";
import { limits } from "@/config/limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HowItWorks } from "@/features/home/how-it-works";
import { useDisplayName } from "@/hooks/use-display-name";
import { apiFetch, ClientApiError } from "@/lib/http/client";
import { normalizeRoomCode } from "@/lib/validation/room-code";
import type { CreateRoomResponse } from "@/types/api";

const tags = [
  { icon: Download, label: "Sem instalação" },
  { icon: Lock, label: "Sala privada" },
  { icon: Users, label: `Até ${limits.maxParticipantsPerRoom} participantes` },
];

export function HomePage() {
  const router = useRouter();
  const { name, saveName, hydrated } = useDisplayName();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [protectRoom, setProtectRoom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const currentName = hydrated && !displayName ? name : displayName;

  async function handleCreate() {
    const saved = saveName(currentName);
    setCreating(true);
    try {
      const result = await apiFetch<CreateRoomResponse>("/api/rooms", {
        method: "POST",
        body: JSON.stringify({
          displayName: saved,
          password: protectRoom ? password : undefined,
        }),
      });
      router.push(`/room/${result.publicCode}`);
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Não foi possível criar a sessão.");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    const saved = saveName(currentName);
    const publicCode = normalizeRoomCode(code);
    if (!saved || publicCode.length < 8) {
      toast.error("Informe seu nome e um código válido.");
      return;
    }
    setJoining(true);
    try {
      router.push(`/room/${publicCode}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32">
        <div
          className="hero-bg-zoom absolute -inset-[8%] bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-feroz.jpg')",
            backgroundPosition: "35% top",
          }}
          aria-hidden
        />
        <div className="hero-overlay absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#FF2D95]/50 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              <TriangleAlert className="h-3.5 w-3.5 text-[#FF2D95]" aria-hidden />
              Suporte em tempo real
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.12] text-white sm:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
              {brand.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#FF2D95]/35 bg-black/35 px-4 py-2 text-sm text-white/90 backdrop-blur-sm"
                >
                  <tag.icon className="h-4 w-4 text-[#FF2D95]" aria-hidden />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#FF2D95]/25 bg-black/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Central de suporte</h2>
            <p className="mt-1 text-sm text-white/65">Crie uma sessão ou entre com um código.</p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setTab("create")}
                className={`min-h-11 rounded-xl text-sm font-medium ${
                  tab === "create"
                    ? "border border-[#FF2D95]/50 bg-[#FF2D95]/15 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Criar sessão
              </button>
              <button
                type="button"
                onClick={() => setTab("join")}
                className={`min-h-11 rounded-xl text-sm font-medium ${
                  tab === "join"
                    ? "border border-[#FF2D95]/50 bg-[#FF2D95]/15 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Entrar com código
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-white" htmlFor="display-name">
                  Seu nome
                </label>
                <Input
                  id="display-name"
                  name="displayName"
                  autoComplete="nickname"
                  placeholder="Seu nome"
                  value={hydrated ? currentName : ""}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={limits.displayNameMax}
                  aria-label="Seu nome"
                />
              </div>

            {tab === "create" ? (
              <>
                <label className="flex items-center justify-between text-sm text-white/80">
                  Proteger com senha
                  <button
                    type="button"
                    role="switch"
                    aria-checked={protectRoom}
                    onClick={() => setProtectRoom((value) => !value)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      protectRoom ? "bg-[#FF2D95]" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                        protectRoom ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
                {protectRoom ? (
                  <Input
                    className="mt-3"
                    type="password"
                    placeholder="Senha da sessão"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    maxLength={limits.passwordMax}
                    aria-label="Senha da sessão"
                  />
                ) : null}
                <Button
                  size="lg"
                  className="mt-6 w-full rounded-full"
                  onClick={() => void handleCreate()}
                  disabled={creating}
                >
                  {creating ? "Abrindo sessão..." : "Iniciar suporte"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2.5">
                  <label className="block text-sm font-medium text-white" htmlFor="room-code-tab">
                    Código da sessão
                  </label>
                  <Input
                    id="room-code-tab"
                    placeholder="XXXX-XXXX"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    aria-label="Código da sessão"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-full"
                  onClick={() => void handleJoin()}
                  disabled={joining}
                >
                  {joining ? "Entrando..." : "Entrar na sessão"}
                </Button>
              </>
            )}
            </div>

            {tab === "create" ? (
              <>
                <div className="my-6 h-px bg-white/10" />
                <p className="text-sm font-medium text-white/80">Já possui um código?</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="XXXX-XXXX"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    aria-label="Código da sessão"
                  />
                  <Button
                    variant="secondary"
                    className="rounded-full border border-[#FF2D95]/40 bg-transparent"
                    onClick={() => void handleJoin()}
                    disabled={joining}
                  >
                    Entrar na sessão
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
      <HowItWorks />
    </>
  );
}
