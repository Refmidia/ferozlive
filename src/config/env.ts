import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const serverSchema = z.object({
  LIVEKIT_URL: optionalUrl,
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export type ServiceStatus = {
  livekit: boolean;
  supabase: boolean;
};

function trimEnv(value: string | undefined) {
  return value?.trim() || undefined;
}

function readRawEnv(): ServerEnv {
  return serverSchema.parse({
    LIVEKIT_URL: trimEnv(process.env.LIVEKIT_URL),
    LIVEKIT_API_KEY: trimEnv(process.env.LIVEKIT_API_KEY),
    LIVEKIT_API_SECRET: trimEnv(process.env.LIVEKIT_API_SECRET),
    NEXT_PUBLIC_SUPABASE_URL: trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CRON_SECRET: trimEnv(process.env.CRON_SECRET),
    ADMIN_USERNAME: trimEnv(process.env.ADMIN_USERNAME),
    ADMIN_PASSWORD: trimEnv(process.env.ADMIN_PASSWORD),
    ADMIN_SESSION_SECRET: trimEnv(process.env.ADMIN_SESSION_SECRET),
    NODE_ENV: process.env.NODE_ENV,
  });
}

export function getServerEnv(): ServerEnv {
  return readRawEnv();
}

export function getServiceStatus(env: ServerEnv = getServerEnv()): ServiceStatus {
  return {
    livekit: Boolean(env.LIVEKIT_URL && env.LIVEKIT_API_KEY && env.LIVEKIT_API_SECRET),
    supabase: Boolean(
      env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}

export function requireLiveKitEnv(env: ServerEnv = getServerEnv()) {
  if (!env.LIVEKIT_URL || !env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    throw new EnvConfigError(
      "O serviço de transmissão ainda não está configurado. Defina LIVEKIT_URL, LIVEKIT_API_KEY e LIVEKIT_API_SECRET.",
    );
  }

  return {
    url: env.LIVEKIT_URL,
    apiKey: env.LIVEKIT_API_KEY,
    apiSecret: env.LIVEKIT_API_SECRET,
  };
}

export function requireSupabaseEnv(env: ServerEnv = getServerEnv()) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new EnvConfigError(
      "O banco ainda não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function requireAdminEnv(env: ServerEnv = getServerEnv()) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    throw new EnvConfigError(
      "O admin ainda não está configurado. Defina ADMIN_USERNAME e ADMIN_PASSWORD.",
    );
  }

  return {
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
    sessionSecret: env.ADMIN_SESSION_SECRET || env.CRON_SECRET || env.ADMIN_PASSWORD,
  };
}

export function toLiveKitHttpUrl(url: string): string {
  return url.replace(/^wss:/i, "https:").replace(/^ws:/i, "http:");
}

export class EnvConfigError extends Error {
  readonly code = "ENV_NOT_CONFIGURED";

  constructor(message: string) {
    super(message);
    this.name = "EnvConfigError";
  }
}
