interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(config.key);

  if (!existing || now - existing.windowStart >= config.windowMs) {
    buckets.set(config.key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= config.limit) {
    const msLeft = config.windowMs - (now - existing.windowStart);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(msLeft / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(config.key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}
