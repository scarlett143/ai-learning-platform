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

export function resetRateLimit(): void {
  hits.clear();
}
