import { limits } from "@/config/limits";
import { createRateLimitKey, getRateLimiter } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/http/errors";
import { getClientIp } from "@/lib/http/responses";

export async function enforceRateLimit(
  request: Request,
  scope: keyof typeof limits.rateLimit,
): Promise<void> {
  const config = limits.rateLimit[scope];
  const result = await getRateLimiter().consume({
    key: createRateLimitKey(scope, getClientIp(request)),
    max: config.max,
    windowMs: config.windowMs,
  });

  if (!result.success) {
    throw tooManyRequests(result.resetAt);
  }
}
