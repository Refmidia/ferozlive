import { AccessToken } from "livekit-server-sdk";
import { TOKEN_TTL } from "@/config/limits";
import { requireLiveKitEnv } from "@/config/env";
import type { ParticipantRole } from "@/types/room";

export async function createParticipantToken(input: {
  identity: string;
  displayName: string;
  role: ParticipantRole;
  livekitRoomName: string;
}): Promise<string> {
  const env = requireLiveKitEnv();
  const token = new AccessToken(env.apiKey, env.apiSecret, {
    identity: input.identity,
    name: input.displayName,
    metadata: JSON.stringify({
      role: input.role,
      displayName: input.displayName,
    }),
    ttl: TOKEN_TTL,
  });

  token.addGrant({
    roomJoin: true,
    room: input.livekitRoomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: false,
    roomAdmin: input.role === "host",
    canPublishSources: [2, 3, 4],
  });

  return token.toJwt();
}
