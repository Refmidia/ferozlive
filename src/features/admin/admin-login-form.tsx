"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ClientApiError } from "@/lib/http/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.replace("/admin");
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center bg-black px-5">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/hero-city.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/70" aria-hidden />
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-[#E91E63]/30 bg-black/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <Logo compact />
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF2D95]">
          Área da staff
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Painel de telagem</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Acesso restrito para gerar códigos e acompanhar os atendimentos.
        </p>
        <label className="mt-6 block text-sm text-white" htmlFor="admin-user">
          Usuário
        </label>
        <Input
          id="admin-user"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2"
        />
        <label className="mt-5 block text-sm text-white" htmlFor="admin-pass">
          Senha
        </label>
        <Input
          id="admin-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2"
        />
        <Button type="submit" size="lg" className="mt-7 w-full rounded-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar no painel"}
        </Button>
      </form>
    </div>
  );
}
