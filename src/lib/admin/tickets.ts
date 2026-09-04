import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportCategoryId, SupportStatus } from "@/config/categories";
import { serviceUnavailable } from "@/lib/http/errors";

export type SupportTicket = {
  id: string;
  room_id: string;
  public_code: string;
  category: SupportCategoryId;
  citizen_name: string | null;
  staff_name: string;
  status: SupportStatus;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

function rethrow(error: { code?: string; message?: string } | null): never {
  if (error?.code === "PGRST205" || error?.message?.includes("support_tickets")) {
    throw serviceUnavailable(
      "As tabelas de atendimento ainda não existem. Execute supabase/migrations/20260904000002_admin_support.sql no SQL Editor.",
    );
  }
  throw error ?? new Error("Falha no atendimento.");
}

export async function insertTicket(
  client: SupabaseClient,
  ticket: Omit<SupportTicket, "id" | "created_at" | "resolved_at">,
): Promise<SupportTicket> {
  const { data, error } = await client.from("support_tickets").insert(ticket).select("*").single();
  if (error || !data) {
    rethrow(error);
  }
  return data as SupportTicket;
}

export async function listTickets(client: SupabaseClient): Promise<SupportTicket[]> {
  const { data, error } = await client
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    rethrow(error);
  }

  return (data as SupportTicket[]) ?? [];
}

export async function updateTicket(
  client: SupabaseClient,
  id: string,
  patch: Partial<Pick<SupportTicket, "status" | "notes" | "citizen_name" | "resolved_at">>,
): Promise<SupportTicket> {
  const { data, error } = await client
    .from("support_tickets")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    rethrow(error);
  }

  return data as SupportTicket;
}

export async function markTicketCitizen(
  client: SupabaseClient,
  publicCode: string,
  citizenName: string,
): Promise<void> {
  const { data } = await client
    .from("support_tickets")
    .select("id, citizen_name, status")
    .eq("public_code", publicCode)
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return;
  }

  const patch: Partial<SupportTicket> = {
    status: "in_progress",
  };
  if (!data.citizen_name) {
    patch.citizen_name = citizenName;
  }

  await client.from("support_tickets").update(patch).eq("id", data.id);
}

export function ticketStats(tickets: SupportTicket[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    today: tickets.filter((ticket) => ticket.created_at.startsWith(today)).length,
  };
}
