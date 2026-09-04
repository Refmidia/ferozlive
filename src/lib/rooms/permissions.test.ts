import { describe, expect, it } from "vitest";
import {
  canAdministerRoom,
  canEndRoom,
  canKickParticipant,
  canStopAnyShare,
  resolveRole,
} from "@/lib/rooms/permissions";

describe("permissões de anfitrião", () => {
  it("concede administração apenas ao anfitrião", () => {
    expect(canAdministerRoom("host")).toBe(true);
    expect(canAdministerRoom("guest")).toBe(false);
    expect(canEndRoom("host")).toBe(true);
    expect(canEndRoom("guest")).toBe(false);
    expect(canStopAnyShare("host")).toBe(true);
    expect(canStopAnyShare("guest")).toBe(false);
  });

  it("impede que o anfitrião seja removido", () => {
    expect(canKickParticipant("host", "guest")).toBe(true);
    expect(canKickParticipant("host", "host")).toBe(false);
    expect(canKickParticipant("guest", "guest")).toBe(false);
  });

  it("resolve o papel a partir da prova de anfitrião", () => {
    expect(resolveRole(true)).toBe("host");
    expect(resolveRole(false)).toBe("guest");
  });
});
