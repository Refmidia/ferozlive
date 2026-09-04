import type { RateLimiter, RateLimitInput, RateLimitResult } from "@/lib/rate-limit/types";

type Bucket = {
  count: number;
  resetAt: number;
};

export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  async consume(input: RateLimitInput): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.buckets.get(input.key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + input.windowMs;
      this.buckets.set(input.key, { count: 1, resetAt });
      return { success: true, remaining: input.max - 1, resetAt };
    }

    if (current.count >= input.max) {
      return { success: false, remaining: 0, resetAt: current.resetAt };
    }

    current.count += 1;
    return {
      success: true,
      remaining: Math.max(0, input.max - current.count),
      resetAt: current.resetAt,
    };
  }
}
