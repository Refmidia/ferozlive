import { describe, expect, it } from "vitest";
import { sanitizeDisplayName } from "@/lib/validation/sanitize";
import { createRoomSchema, joinRoomSchema } from "@/lib/validation/schemas";

describe("validações", () => {
  it("sanitiza nomes", () => {
    expect(sanitizeDisplayName("  Ana\nMaria  ")).toBe("Ana Maria");
    expect(sanitizeDisplayName("x".repeat(80)).length).toBe(32);
  });

  it("aceita criação válida", () => {
    const parsed = createRoomSchema.parse({
      displayName: "  Dinho  ",
      password: "abcde",
    });
    expect(parsed.displayName).toBe("Dinho");
    expect(parsed.password).toBe("abcde");
  });

  it("rejeita senha curta", () => {
    expect(() =>
      createRoomSchema.parse({ displayName: "Dinho", password: "ab" }),
    ).toThrow();
  });

  it("normaliza o código na entrada", () => {
    const parsed = joinRoomSchema.parse({
      code: "ab3dk7m2",
      displayName: "Ana",
    });
    expect(parsed.code).toBe("AB3D-K7M2");
  });
});
