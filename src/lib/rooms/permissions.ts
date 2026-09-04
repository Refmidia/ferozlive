import type { ParticipantRole } from "@/types/room";

export function canAdministerRoom(role: ParticipantRole): boolean {
  return role === "host";
}

export function canEndRoom(role: ParticipantRole): boolean {
  return role === "host";
}

export function canKickParticipant(role: ParticipantRole, targetRole: ParticipantRole): boolean {
  return role === "host" && targetRole !== "host";
}

export function canStopAnyShare(role: ParticipantRole): boolean {
  return role === "host";
}

export function resolveRole(isHost: boolean): ParticipantRole {
  return isHost ? "host" : "guest";
}
