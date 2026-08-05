// In-memory fixed-window rate limiter. Good enough for a single long-running
// Node process (e.g. `next start` on a VM/container). On multi-instance
// serverless hosting (e.g. Vercel functions), each instance keeps its own
// counters, so this only bounds abuse per-instance rather than globally —
// swap for Upstash Redis / Vercel KV if that stronger guarantee is needed.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function getClientIp(headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
