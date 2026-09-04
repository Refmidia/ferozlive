export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export type RateLimitInput = {
  key: string;
  max: number;
  windowMs: number;
};

export interface RateLimiter {
  consume(input: RateLimitInput): Promise<RateLimitResult>;
}
