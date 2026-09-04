import { describe, expect, it, vi } from "vitest";

vi.stubEnv("ADMIN_USERNAME", "feroz");
vi.stubEnv("ADMIN_PASSWORD", "Feroz#Staff2026");
vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret-admin");

const { createAdminSession, readAdminSession, verifyAdminCredentials } = await import(
  "@/lib/admin/auth"
);

describe("admin auth", () => {
  it("aceita apenas as credenciais corretas", () => {
    expect(verifyAdminCredentials("feroz", "Feroz#Staff2026")).toBe(true);
    expect(verifyAdminCredentials("feroz", "errada")).toBe(false);
    expect(verifyAdminCredentials("outro", "Feroz#Staff2026")).toBe(false);
  });

  it("emite sessão válida e rejeita token adulterado", () => {
    const token = createAdminSession("feroz");
    expect(readAdminSession(token)?.u).toBe("feroz");
    expect(readAdminSession(`${token}x`)).toBeNull();
  });
});
