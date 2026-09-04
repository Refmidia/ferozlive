import { describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/crypto/hash";
import { AppError } from "@/lib/http/errors";
import { assertRoomJoinable, toPublicRoom, verifyRoomPassword } from "@/lib/rooms/service";
import type { RoomRecord } from "@/types/room";

function makeRoom(overrides: Partial<RoomRecord> = {}): RoomRecord {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    public_code: "ABCD-EFGH",
    livekit_room_name: "sp_testroom",
    host_token_hash: "abc",
    password_hash: null,
    status: "active",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    ended_at: null,
    ...overrides,
  };
}

describe("regras da sala", () => {
  it("expõe apenas a visão pública", () => {
    const view = toPublicRoom(makeRoom({ password_hash: "hash" }));
    expect(view.hasPassword).toBe(true);
    expect(view).not.toHaveProperty("host_token_hash");
    expect(view).not.toHaveProperty("password_hash");
  });

  it("bloqueia sala encerrada ou expirada", () => {
    expect(() => assertRoomJoinable(makeRoom({ status: "ended" }))).toThrow(AppError);
    expect(() =>
      assertRoomJoinable(makeRoom({ expires_at: new Date(Date.now() - 1000).toISOString() })),
    ).toThrow(AppError);
  });

  it("valida senha quando a sala é protegida", async () => {
    const room = makeRoom({ password_hash: await hashPassword("segura") });
    await expect(verifyRoomPassword(room, undefined)).resolves.toBe("required");
    await expect(verifyRoomPassword(room, "errada")).resolves.toBe("invalid");
    await expect(verifyRoomPassword(room, "segura")).resolves.toBe("ok");
  });
});
