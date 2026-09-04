import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { limits, ROOM_TTL_MS } from "@/config/limits";
import {
  generateIdentity,
  generateLiveKitRoomName,
  generateRoomCode,
  generateSecret,
  isValidRoomCodeFormat,
} from "@/lib/crypto/codes";
import { hashPassword, sha256Hex, verifyPassword } from "@/lib/crypto/hash";
import { unauthorized, badRequest, conflict, notFound } from "@/lib/http/errors";
import { createParticipantToken } from "@/lib/livekit/token";
import {
  countLiveKitParticipants,
  deleteLiveKitRoom,
  muteScreenShare,
  provisionLiveKitRoom,
  removeLiveKitParticipant,
} from "@/lib/livekit/admin";
import { getHostSecretFromRequest, isHostSecret } from "@/lib/auth/host";
import {
  findRoomByCode,
  insertRoom,
  insertRoomEvent,
  updateRoomStatus,
} from "@/lib/supabase/admin";
import { resolveRole } from "@/lib/rooms/permissions";
import type { PublicRoomView, RoomRecord } from "@/types/room";

const CODE_ATTEMPTS = 8;

export function toPublicRoom(room: RoomRecord): PublicRoomView {
  return {
    publicCode: room.public_code,
    status: room.status,
    hasPassword: Boolean(room.password_hash),
    expiresAt: room.expires_at,
    participantLimit: limits.maxParticipantsPerRoom,
  };
}

export function assertRoomJoinable(room: RoomRecord, now = Date.now()): void {
  if (room.status !== "active") {
    throw notFound();
  }

  if (new Date(room.expires_at).getTime() <= now) {
    throw notFound();
  }
}

export async function createRoomRecord(
  client: SupabaseClient,
  input: { password?: string },
): Promise<{ room: RoomRecord; hostSecret: string }> {
  const hostSecret = generateSecret();
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const expiresAt = new Date(Date.now() + ROOM_TTL_MS).toISOString();

  let lastError: unknown;

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const publicCode = generateRoomCode();
    try {
      const room = await insertRoom(client, {
        id: randomUUID(),
        public_code: publicCode,
        livekit_room_name: generateLiveKitRoomName(),
        host_token_hash: sha256Hex(hostSecret),
        password_hash: passwordHash,
        status: "active",
        expires_at: expiresAt,
      });

      await insertRoomEvent(client, {
        room_id: room.id,
        event_type: "created",
        metadata: { hasPassword: Boolean(passwordHash) },
      });

      return { room, hostSecret };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Não foi possível gerar um código único.");
}

export async function createConfiguredRoom(
  client: SupabaseClient,
  input: { password?: string },
) {
  const created = await createRoomRecord(client, input);

  try {
    await provisionLiveKitRoom(created.room.livekit_room_name);
  } catch (error) {
    await updateRoomStatus(client, created.room.id, "ended", {
      ended_at: new Date().toISOString(),
    });
    throw error;
  }

  return created;
}

export async function loadJoinableRoom(
  client: SupabaseClient,
  code: string,
): Promise<RoomRecord> {
  if (!isValidRoomCodeFormat(code)) {
    throw badRequest("Use um código no formato XXXX-XXXX.");
  }

  const room = await findRoomByCode(client, code);
  if (!room) {
    throw notFound();
  }

  assertRoomJoinable(room);
  return room;
}

export async function verifyRoomPassword(
  room: RoomRecord,
  password: string | undefined,
): Promise<"ok" | "required" | "invalid"> {
  if (!room.password_hash) {
    return "ok";
  }

  if (!password) {
    return "required";
  }

  const valid = await verifyPassword(password, room.password_hash);
  return valid ? "ok" : "invalid";
}

export async function ensureRoomCapacity(room: RoomRecord): Promise<void> {
  const count = await countLiveKitParticipants(room.livekit_room_name);
  if (count >= limits.maxParticipantsPerRoom) {
    throw conflict("Esta sala já atingiu o limite de participantes.", "ROOM_FULL");
  }
}

export async function issueRoomToken(input: {
  room: RoomRecord;
  displayName: string;
  isHost: boolean;
}) {
  const role = resolveRole(input.isHost);
  const identity = input.isHost
    ? `host_${input.room.id.replaceAll("-", "").slice(0, 24)}`
    : generateIdentity();

  const token = await createParticipantToken({
    identity,
    displayName: input.displayName,
    role,
    livekitRoomName: input.room.livekit_room_name,
  });

  return { token, identity, role };
}

export async function endRoomForEveryone(
  client: SupabaseClient,
  room: RoomRecord,
): Promise<void> {
  const endedAt = new Date().toISOString();
  await updateRoomStatus(client, room.id, "ended", { ended_at: endedAt });
  await insertRoomEvent(client, {
    room_id: room.id,
    event_type: "ended",
    metadata: { source: "host" },
  });
  await deleteLiveKitRoom(room.livekit_room_name);
}

export async function kickParticipantFromRoom(
  client: SupabaseClient,
  room: RoomRecord,
  identity: string,
): Promise<void> {
  if (identity.startsWith("host_")) {
    throw unauthorized("O anfitrião não pode ser removido.");
  }

  await removeLiveKitParticipant(room.livekit_room_name, identity);
  await insertRoomEvent(client, {
    room_id: room.id,
    event_type: "kicked",
    participant_identity: identity,
  });
}

export async function stopParticipantShare(
  client: SupabaseClient,
  room: RoomRecord,
  identity: string,
  trackSid?: string,
): Promise<void> {
  await muteScreenShare(room.livekit_room_name, identity, trackSid);
  await insertRoomEvent(client, {
    room_id: room.id,
    event_type: "share_stopped",
    participant_identity: identity,
    metadata: { by: "host" },
  });
}

export function hostFromRequest(request: Request, room: RoomRecord): boolean {
  return isHostSecret(room, getHostSecretFromRequest(request, room.public_code));
}
