import type { ParticipantRole } from "@/types/room";

export type ParticipantMetadata = {
  role: ParticipantRole;
  displayName: string;
};

export type ParticipantView = {
  identity: string;
  displayName: string;
  role: ParticipantRole;
  isSpeaking: boolean;
  isSharing: boolean;
  micEnabled: boolean;
};

export function parseParticipantMetadata(
  raw: string | undefined,
): ParticipantMetadata | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ParticipantMetadata>;
    if (parsed.role !== "host" && parsed.role !== "guest") {
      return null;
    }
    if (typeof parsed.displayName !== "string" || parsed.displayName.length === 0) {
      return null;
    }
    return {
      role: parsed.role,
      displayName: parsed.displayName,
    };
  } catch {
    return null;
  }
}
