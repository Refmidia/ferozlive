import { createHmac, timingSafeEqual } from "node:crypto";
import { requireAdminEnv } from "@/config/env";
import { sha256Hex } from "@/lib/crypto/hash";
import { readCookie } from "@/lib/auth/host";
import { unauthorized } from "@/lib/http/errors";

export const ADMIN_COOKIE = "fc_admin";
const SESSION_HOURS = 12;

type AdminPayload = {
  u: string;
  exp: number;
};

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function verifyAdminCredentials(username: string, password: string) {
  const env = requireAdminEnv();
  return (
    safeEqual(sha256Hex(username), sha256Hex(env.username)) &&
    safeEqual(sha256Hex(password), sha256Hex(env.password))
  );
}

export function createAdminSession(username: string) {
  const env = requireAdminEnv();
  const payload: AdminPayload = {
    u: username,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, env.sessionSecret)}`;
}

export function readAdminSession(token: string | null): AdminPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const env = requireAdminEnv();
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(sign(encoded, env.sessionSecret), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as AdminPayload;
    if (!payload.u || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function adminCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function requireAdmin(request: Request) {
  const session = readAdminSession(readCookie(request.headers.get("cookie"), ADMIN_COOKIE));
  if (!session) {
    throw unauthorized("Faça login no painel da staff.");
  }
  return session;
}
