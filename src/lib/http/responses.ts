import { ZodError } from "zod";
import { EnvConfigError } from "@/config/env";
import { AppError } from "@/lib/http/errors";

export function jsonOk<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, ...data }, init);
}

export function jsonError(error: unknown): Response {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return Response.json(
      {
        ok: false,
        error: first?.message ?? "Dados inválidos.",
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  if (error instanceof EnvConfigError) {
    return Response.json(
      { ok: false, error: error.message, code: error.code },
      { status: 503 },
    );
  }

  if (error instanceof AppError) {
    const headers =
      error.code === "RATE_LIMITED" && "resetAt" in error
        ? {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil(((error as AppError & { resetAt: number }).resetAt - Date.now()) / 1000),
              ),
            ),
          }
        : undefined;

    return Response.json(
      { ok: false, error: error.message, code: error.code },
      { status: error.status, headers },
    );
  }

  console.error("[screenparty] unexpected error", error);
  return Response.json(
    {
      ok: false,
      error: "Não foi possível concluir esta ação agora.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function getRequestOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Envie um JSON válido.", 400, "INVALID_JSON");
  }
}
