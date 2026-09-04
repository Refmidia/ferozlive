import { randomInt, randomBytes } from "node:crypto";
import { CODE_ALPHABET } from "@/lib/validation/room-code";

export function generateRoomCode(length = 8): string {
  const chars: string[] = [];

  for (let i = 0; i < length; i += 1) {
    chars.push(CODE_ALPHABET[randomInt(CODE_ALPHABET.length)] ?? "A");
  }

  const raw = chars.join("");
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export function generateSecret(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function generateIdentity(prefix = "spu"): string {
  return `${prefix}_${randomBytes(16).toString("hex")}`;
}

export function generateLiveKitRoomName(): string {
  return `sp_${randomBytes(16).toString("hex")}`;
}

export { CODE_ALPHABET, isValidRoomCodeFormat, normalizeRoomCode } from "@/lib/validation/room-code";
