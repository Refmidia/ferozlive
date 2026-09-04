import { HOST_COOKIE_PREFIX, ROOM_TTL_MS } from "@/config/limits";
import { safeEqualHex, sha256Hex } from "@/lib/crypto/hash";
import { normalizeRoomCode } from "@/lib/validation/room-code";
import type { RoomRecord } from "@/types/room";

export function hostCookieName(publicCode: string): string {
  return `${HOST_COOKIE_PREFIX}${normalizeRoomCode(publicCode).replace("-", "")}`;
}

export function createHostCookie(publicCode: string, secret: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${hostCookieName(publicCode)}=${secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(ROOM_TTL_MS / 1000)}${secure}`;
}

export function clearHostCookie(publicCode: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${hostCookieName(publicCode)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) {
    return null;
  }

  const parts = header.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) {
      return rest.join("=");
    }
  }

  return null;
}

export function isHostSecret(room: RoomRecord, secret: string | null): boolean {
  if (!secret) {
    return false;
  }

  return safeEqualHex(room.host_token_hash, sha256Hex(secret));
}

export function getHostSecretFromRequest(request: Request, publicCode: string): string | null {
  return readCookie(request.headers.get("cookie"), hostCookieName(publicCode));
}

export function assertHost(room: RoomRecord, secret: string | null): void {
  if (!isHostSecret(room, secret)) {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }
}
