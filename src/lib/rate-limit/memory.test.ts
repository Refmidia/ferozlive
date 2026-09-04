import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "@/lib/rate-limit/memory";

describe("rate limit em memória", () => {
  it("bloqueia após o limite", async () => {
    const limiter = new MemoryRateLimiter();
    await limiter.consume({ key: "create:1", max: 2, windowMs: 60_000 });
    const second = await limiter.consume({ key: "create:1", max: 2, windowMs: 60_000 });
    const third = await limiter.consume({ key: "create:1", max: 2, windowMs: 60_000 });

    expect(second.success).toBe(true);
    expect(third.success).toBe(false);
  });
});
