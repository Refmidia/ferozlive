import { MemoryRateLimiter } from "@/lib/rate-limit/memory";
import type { RateLimiter } from "@/lib/rate-limit/types";

let limiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!limiter) {
    limiter = new MemoryRateLimiter();
  }

  return limiter;
}

export function createRateLimitKey(scope: string, ip: string): string {
  return `${scope}:${ip}`;
}

/**
 * Em produção com várias instâncias da Vercel, troque o fallback em memória
 * por um backend compartilhado (Upstash Redis é a opção indicada).
 *
 * Exemplo:
 *   UPSTASH_REDIS_REST_URL=
 *   UPSTASH_REDIS_REST_TOKEN=
 *
 * A interface RateLimiter permanece a mesma; apenas substitua getRateLimiter().
 */
export { MemoryRateLimiter };
export type { RateLimiter, RateLimitInput, RateLimitResult } from "@/lib/rate-limit/types";
