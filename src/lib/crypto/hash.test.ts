import { describe, expect, it } from "vitest";
import { hashPassword, safeEqualHex, sha256Hex, verifyPassword } from "@/lib/crypto/hash";

describe("senha e hash", () => {
  it("gera hash e valida a senha correta", async () => {
    const hash = await hashPassword("amigo123");
    expect(hash).not.toBe("amigo123");
    await expect(verifyPassword("amigo123", hash)).resolves.toBe(true);
  });

  it("rejeita senha incorreta", async () => {
    const hash = await hashPassword("amigo123");
    await expect(verifyPassword("outra", hash)).resolves.toBe(false);
  });

  it("compara hashes com igualdade constante", () => {
    const digest = sha256Hex("segredo");
    expect(safeEqualHex(digest, sha256Hex("segredo"))).toBe(true);
    expect(safeEqualHex(digest, sha256Hex("outro"))).toBe(false);
  });
});
