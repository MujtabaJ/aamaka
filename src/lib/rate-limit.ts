type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
