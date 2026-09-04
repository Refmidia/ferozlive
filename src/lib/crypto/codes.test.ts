import { describe, expect, it } from "vitest";
import { generateRoomCode } from "@/lib/crypto/codes";
import { isValidRoomCodeFormat, normalizeRoomCode } from "@/lib/validation/room-code";

describe("gerador de códigos", () => {
  it("gera códigos no formato XXXX-XXXX", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = generateRoomCode();
      expect(isValidRoomCodeFormat(code)).toBe(true);
    }
  });

  it("não usa caracteres ambíguos", () => {
    const codes = Array.from({ length: 80 }, () => generateRoomCode()).join("");
    expect(codes).not.toMatch(/[01IOio]/);
  });

  it("produz códigos distintos em sequência", () => {
    const unique = new Set(Array.from({ length: 40 }, () => generateRoomCode()));
    expect(unique.size).toBe(40);
  });

  it("normaliza entrada do usuário", () => {
    expect(normalizeRoomCode("ab3d-k7m2")).toBe("AB3D-K7M2");
    expect(normalizeRoomCode("ab3dk7m2")).toBe("AB3D-K7M2");
  });
});
