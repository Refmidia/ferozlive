import { describe, expect, it } from "vitest";
import { isHostSecret } from "@/lib/auth/host";
import { sha256Hex } from "@/lib/crypto/hash";
import type { RoomRecord } from "@/types/room";

const room: RoomRecord = {
  id: "11111111-1111-1111-1111-111111111111",
  public_code: "WXYZ-2345",
  livekit_room_name: "sp_abc",
  host_token_hash: sha256Hex("host-secret"),
  password_hash: null,
  status: "active",
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  ended_at: null,
};

describe("prova de anfitrião", () => {
  it("aceita apenas o segredo correto", () => {
    expect(isHostSecret(room, "host-secret")).toBe(true);
    expect(isHostSecret(room, "outro")).toBe(false);
    expect(isHostSecret(room, null)).toBe(false);
  });
});
