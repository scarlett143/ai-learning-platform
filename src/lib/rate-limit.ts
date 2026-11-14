/**
 * Sliding-window rate limiter keyed by caller (IP). Protects the billed Gemini endpoint from abuse.
 * ponytail: in-memory per instance, so limits are per Cloud Run instance; use Redis/Firestore for a global limit.
 */
const hits = new Map<string, number[]>();

export function allowRequest(key: string, limit = 20, windowMs = 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every(t => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}

export function clientKey(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

/** True when this caller has exceeded `limit` requests/minute on `scope` (each route has its own bucket). */
export function rateLimited(req: Request, scope: string, limit = 60): boolean {
  return !allowRequest(`${scope}:${clientKey(req.headers)}`, limit);
}

/** True when the declared body size exceeds `max` bytes (cheap check before parsing JSON). */
export function tooLarge(req: Request, max = 100_000): boolean {
  return Number(req.headers.get('content-length') ?? 0) > max;
}

export function resetRateLimit(): void {
  hits.clear();
}
