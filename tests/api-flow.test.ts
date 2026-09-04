import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomRecord } from "@/types/room";

const rooms: RoomRecord[] = [];

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdmin: () => ({}),
  insertRoom: vi.fn(async (_client: unknown, room: Omit<RoomRecord, "created_at" | "ended_at">) => {
    const created: RoomRecord = {
      ...room,
      created_at: new Date().toISOString(),
      ended_at: null,
    };
    rooms.push(created);
    return created;
  }),
  findRoomByCode: vi.fn(async (_client: unknown, code: string) => {
    return rooms.find((room) => room.public_code === code) ?? null;
  }),
  insertRoomEvent: vi.fn(async () => undefined),
  updateRoomStatus: vi.fn(async () => undefined),
  expireActiveRooms: vi.fn(async () => 0),
}));

vi.mock("@/lib/livekit/admin", () => ({
  provisionLiveKitRoom: vi.fn(async () => undefined),
  countLiveKitParticipants: vi.fn(async () => 0),
  deleteLiveKitRoom: vi.fn(async () => undefined),
  removeLiveKitParticipant: vi.fn(async () => undefined),
  muteScreenShare: vi.fn(async () => undefined),
  createRoomService: vi.fn(),
}));

vi.mock("@/lib/livekit/token", () => ({
  createParticipantToken: vi.fn(async () => "header.payload.signature"),
}));

vi.mock("@/config/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/env")>();
  return {
    ...actual,
    requireLiveKitEnv: () => ({
      url: "wss://example.livekit.cloud",
      apiKey: "key",
      apiSecret: "secret",
    }),
    requireSupabaseEnv: () => ({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role",
      anonKey: "anon",
    }),
  };
});

describe("fluxo criar e entrar", () => {
  beforeEach(() => {
    rooms.length = 0;
  });

  it("cria a sala, entra e emite token de anfitrião", async () => {
    const { POST: createRoom } = await import("@/app/api/rooms/route");
    const { POST: joinRoom } = await import("@/app/api/rooms/join/route");
    const { POST: issueToken } = await import("@/app/api/livekit/token/route");

    const created = await createRoom(
      new Request("http://localhost/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify({ displayName: "Dinho" }),
      }),
    );

    expect(created.status).toBe(200);
    const createdBody = (await created.json()) as {
      ok: boolean;
      publicCode: string;
      inviteUrl: string;
    };
    expect(createdBody.ok).toBe(true);
    expect(createdBody.publicCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(createdBody.inviteUrl).toContain(createdBody.publicCode);

    const cookie = created.headers.get("set-cookie");
    expect(cookie).toBeTruthy();

    const joined = await joinRoom(
      new Request("http://localhost/api/rooms/join", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookie ?? "",
        },
        body: JSON.stringify({
          code: createdBody.publicCode,
          displayName: "Dinho",
        }),
      }),
    );

    const joinedBody = (await joined.json()) as {
      ok: boolean;
      isHost: boolean;
      requiresPassword: boolean;
    };
    expect(joined.status).toBe(200);
    expect(joinedBody.isHost).toBe(true);
    expect(joinedBody.requiresPassword).toBe(false);

    const token = await issueToken(
      new Request("http://localhost/api/livekit/token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookie ?? "",
        },
        body: JSON.stringify({
          code: createdBody.publicCode,
          displayName: "Dinho",
        }),
      }),
    );

    const tokenBody = (await token.json()) as {
      ok: boolean;
      role: string;
      token: string;
    };
    expect(token.status).toBe(200);
    expect(tokenBody.role).toBe("host");
    expect(tokenBody.token).toBe("header.payload.signature");
  });

  it("recusa entrada com senha inválida", async () => {
    const { POST: createRoom } = await import("@/app/api/rooms/route");
    const { POST: joinRoom } = await import("@/app/api/rooms/join/route");

    const created = await createRoom(
      new Request("http://localhost/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Ana", password: "forte123" }),
      }),
    );
    const createdBody = (await created.json()) as { publicCode: string };

    const joined = await joinRoom(
      new Request("http://localhost/api/rooms/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: createdBody.publicCode,
          displayName: "Beto",
          password: "errada",
        }),
      }),
    );

    expect(joined.status).toBe(401);
  });

  it("recusa ação administrativa sem cookie de anfitrião", async () => {
    const { POST: createRoom } = await import("@/app/api/rooms/route");
    const { POST: endRoom } = await import("@/app/api/rooms/[code]/end/route");

    const created = await createRoom(
      new Request("http://localhost/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Ana" }),
      }),
    );
    const createdBody = (await created.json()) as { publicCode: string };

    const ended = await endRoom(
      new Request(`http://localhost/api/rooms/${createdBody.publicCode}/end`, {
        method: "POST",
      }),
      { params: Promise.resolve({ code: createdBody.publicCode }) },
    );

    expect(ended.status).toBe(401);
  });
});
