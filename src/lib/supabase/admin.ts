import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/config/env";
import { serviceUnavailable } from "@/lib/http/errors";
import type { RoomEventType, RoomRecord, RoomStatus } from "@/types/room";

function rethrowSupabase(error: { code?: string; message?: string } | null): never {
  if (error?.code === "PGRST205" || error?.message?.includes("public.rooms")) {
    throw serviceUnavailable(
      "As tabelas do ScreenParty ainda não existem no Supabase. Execute o arquivo supabase/migrations/20260904000001_init_screenparty.sql no SQL Editor.",
    );
  }

  throw error ?? new Error("Falha ao acessar o banco.");
}

export function createSupabaseAdmin(): SupabaseClient {
  const env = requireSupabaseEnv();
  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function insertRoom(
  client: SupabaseClient,
  room: Omit<RoomRecord, "created_at" | "ended_at"> & {
    created_at?: string;
    ended_at?: string | null;
  },
): Promise<RoomRecord> {
  const { data, error } = await client.from("rooms").insert(room).select("*").single();

  if (error || !data) {
    rethrowSupabase(error);
  }

  return data as RoomRecord;
}

export async function findRoomByCode(
  client: SupabaseClient,
  publicCode: string,
): Promise<RoomRecord | null> {
  const { data, error } = await client
    .from("rooms")
    .select("*")
    .eq("public_code", publicCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RoomRecord | null) ?? null;
}

export async function updateRoomStatus(
  client: SupabaseClient,
  roomId: string,
  status: RoomStatus,
  extra: { ended_at?: string } = {},
): Promise<void> {
  const { error } = await client
    .from("rooms")
    .update({ status, ...extra })
    .eq("id", roomId);

  if (error) {
    throw error;
  }
}

export async function insertRoomEvent(
  client: SupabaseClient,
  event: {
    room_id: string;
    event_type: RoomEventType;
    participant_identity?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await client.from("room_events").insert({
    room_id: event.room_id,
    event_type: event.event_type,
    participant_identity: event.participant_identity ?? null,
    metadata: event.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function expireActiveRooms(
  client: SupabaseClient,
  nowIso: string,
): Promise<number> {
  const { data, error } = await client
    .from("rooms")
    .update({ status: "expired", ended_at: nowIso })
    .eq("status", "active")
    .lt("expires_at", nowIso)
    .select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}
