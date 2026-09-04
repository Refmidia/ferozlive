"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_STATUSES,
  categoryLabel,
  statusLabel,
  type SupportCategoryId,
  type SupportStatus,
} from "@/config/categories";
import { useClipboard } from "@/hooks/use-clipboard";
import { apiFetch, ClientApiError } from "@/lib/http/client";
import type { SupportTicket } from "@/lib/admin/tickets";

type SessionList = {
  tickets: SupportTicket[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    today: number;
  };
};

export function AdminDashboard() {
  const router = useRouter();
  const { copy, copied } = useClipboard();
  const [ready, setReady] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SessionList["stats"] | null>(null);
  const [filter, setFilter] = useState<"all" | SupportCategoryId>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SupportStatus>("all");
  const [category, setCategory] = useState<SupportCategoryId>("ocorrencia");
  const [citizenName, setCitizenName] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ publicCode: string; inviteUrl: string } | null>(null);

  async function load() {
    const data = await apiFetch<SessionList>("/api/admin/sessions");
    setTickets(data.tickets);
    setStats(data.stats);
  }

  useEffect(() => {
    void apiFetch<{ username: string }>("/api/admin/me")
      .then(() => load())
      .then(() => setReady(true))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const visible = useMemo(
    () =>
      tickets.filter((ticket) => {
        const categoryOk = filter === "all" || ticket.category === filter;
        const statusOk = statusFilter === "all" || ticket.status === statusFilter;
        return categoryOk && statusOk;
      }),
    [tickets, filter, statusFilter],
  );

  async function createSession() {
    setCreating(true);
    try {
      const result = await apiFetch<{ publicCode: string; inviteUrl: string }>(
        "/api/admin/sessions",
        {
          method: "POST",
          body: JSON.stringify({
            category,
            citizenName: citizenName || undefined,
            notes: notes || undefined,
            password: password || undefined,
          }),
        },
      );
      setCreated({ publicCode: result.publicCode, inviteUrl: result.inviteUrl });
      setCitizenName("");
      setNotes("");
      setPassword("");
      toast.success("Código gerado.");
      await load();
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Não foi possível criar o código.");
    } finally {
      setCreating(false);
    }
  }

  async function changeStatus(id: string, status: SupportStatus) {
    try {
      await apiFetch(`/api/admin/sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (error) {
      toast.error(error instanceof ClientApiError ? error.message : "Não foi possível atualizar.");
    }
  }

  if (!ready) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-[#08070B] text-white">
      <header className="border-b border-white/10 bg-black/70">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <Logo compact />
            <span className="hidden h-7 w-px bg-white/15 sm:block" aria-hidden />
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#FF2D95]">Staff</p>
              <p className="text-sm text-white/70">Controle de telagem</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              void apiFetch("/api/admin/logout", { method: "POST" }).then(() => {
                router.replace("/admin/login");
              });
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-[#E91E63]/30 bg-[#10080F] p-5">
          <h1 className="text-xl font-semibold">Nova sessão</h1>
          <p className="mt-1 text-sm text-white/55">Gere o código e envie para o cidadão.</p>

          <label className="mt-5 block text-sm" htmlFor="category">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as SupportCategoryId)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--sp-border)] bg-black/50 px-3 text-white"
          >
            {SUPPORT_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm" htmlFor="citizen">
            Nome do cidadão
          </label>
          <Input
            id="citizen"
            className="mt-2"
            placeholder="Opcional"
            value={citizenName}
            onChange={(event) => setCitizenName(event.target.value)}
          />

          <label className="mt-4 block text-sm" htmlFor="notes">
            Observação
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            className="mt-2 min-h-24 w-full rounded-2xl border border-[var(--sp-border)] bg-black/50 px-3 py-3 text-sm text-white"
            placeholder="O que aconteceu"
          />

          <label className="mt-4 block text-sm" htmlFor="pass">
            Senha da sala
          </label>
          <Input
            id="pass"
            className="mt-2"
            type="password"
            placeholder="Opcional"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button
            size="lg"
            className="mt-5 w-full rounded-full"
            onClick={() => void createSession()}
            disabled={creating}
          >
            {creating ? "Gerando..." : "Gerar código"}
          </Button>

          {created ? (
            <div className="mt-5 rounded-2xl border border-[#E91E63]/35 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Código</p>
              <p className="mt-1 text-2xl font-semibold">{created.publicCode}</p>
              <div className="mt-3 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  onClick={() => void copy(created.publicCode, "code")}
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied === "code" ? "Código copiado" : "Copiar código"}
                </Button>
                <Button variant="secondary" onClick={() => void copy(created.inviteUrl, "link")}>
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied === "link" ? "Link copiado" : "Copiar convite"}
                </Button>
                <a
                  href={created.inviteUrl}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#E91E63]/40 text-sm"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Abrir sala
                </a>
              </div>
            </div>
          ) : null}
        </aside>

        <section>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Hoje", stats?.today ?? 0],
              ["Abertos", stats?.open ?? 0],
              ["Em atendimento", stats?.inProgress ?? 0],
              ["Resolvidos", stats?.resolved ?? 0],
            ].map(([label, value]) => (
              <article key={String(label)} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
              className="min-h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-sm"
              aria-label="Filtrar categoria"
            >
              <option value="all">Todas as categorias</option>
              {SUPPORT_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="min-h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-sm"
              aria-label="Filtrar status"
            >
              <option value="all">Todos os status</option>
              {SUPPORT_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-white/45">
                <tr>
                  <th className="px-4 py-3 font-medium">Cidadão</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-white/45">
                      Nenhum atendimento ainda.
                    </td>
                  </tr>
                ) : (
                  visible.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-white/8 bg-black/30">
                      <td className="px-4 py-4">
                        <p className="font-medium">{ticket.citizen_name || "Aguardando entrada"}</p>
                        <p className="text-xs text-white/40">{ticket.notes || "Sem observação"}</p>
                      </td>
                      <td className="px-4 py-4 text-white/75">{categoryLabel(ticket.category)}</td>
                      <td className="px-4 py-4 font-semibold">{ticket.public_code}</td>
                      <td className="px-4 py-4">{statusLabel(ticket.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-white/15 px-3 py-1 text-xs"
                            onClick={() => void copy(ticket.public_code, ticket.id)}
                          >
                            {copied === ticket.id ? "Copiado" : "Copiar"}
                          </button>
                          <a
                            href={`/room/${ticket.public_code}`}
                            className="rounded-full border border-[#E91E63]/40 px-3 py-1 text-xs"
                          >
                            Abrir
                          </a>
                          {ticket.status !== "resolved" ? (
                            <button
                              type="button"
                              className="rounded-full bg-[#E91E63] px-3 py-1 text-xs"
                              onClick={() => void changeStatus(ticket.id, "resolved")}
                            >
                              Resolver
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
