import { RoomServiceClient } from "livekit-server-sdk";
import { limits } from "@/config/limits";
import { requireLiveKitEnv, toLiveKitHttpUrl } from "@/config/env";
import { unauthorized } from "@/lib/http/errors";

export function createRoomService(): RoomServiceClient {
  const env = requireLiveKitEnv();
  return new RoomServiceClient(toLiveKitHttpUrl(env.url), env.apiKey, env.apiSecret);
}

function isLiveKitAuthError(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
  const message = error instanceof Error ? error.message : "";
  return status === 401 || /unauthorized|invalid token/i.test(message);
}

export async function provisionLiveKitRoom(roomName: string): Promise<void> {
  const service = createRoomService();

  try {
    await service.createRoom({
      name: roomName,
      maxParticipants: limits.maxParticipantsPerRoom,
      emptyTimeout: 10 * 60,
      departureTimeout: 20,
    });
  } catch (error) {
    if (isLiveKitAuthError(error)) {
      throw unauthorized(
        "O LiveKit recusou a API Key/Secret. Copie de novo em cloud.livekit.io → Feroz Live → Settings → Keys.",
      );
    }
    throw error;
  }
}

export async function countLiveKitParticipants(roomName: string): Promise<number> {
  const service = createRoomService();

  try {
    const participants = await service.listParticipants(roomName);
    return participants.length;
  } catch {
    return 0;
  }
}

export async function deleteLiveKitRoom(roomName: string): Promise<void> {
  const service = createRoomService();

  try {
    await service.deleteRoom(roomName);
  } catch {
    // A sala do LiveKit pode já ter sido encerrada pelo timeout.
  }
}

export async function removeLiveKitParticipant(
  roomName: string,
  identity: string,
): Promise<void> {
  const service = createRoomService();
  await service.removeParticipant(roomName, identity);
}

export async function muteScreenShare(
  roomName: string,
  identity: string,
  trackSid?: string,
): Promise<void> {
  const service = createRoomService();
  const participant = await service.getParticipant(roomName, identity);
  const tracks = participant.tracks ?? [];

  const targets = trackSid
    ? tracks.filter((track) => track.sid === trackSid)
    : tracks.filter((track) => {
        const source = Number(track.source);
        return source === 3 || source === 4;
      });

  await Promise.all(
    targets.map((track) =>
      service.mutePublishedTrack(roomName, identity, track.sid, true),
    ),
  );
}
