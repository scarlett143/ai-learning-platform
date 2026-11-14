import { describe, it, expect, beforeEach } from 'vitest';
import { allowRequest, clientKey, resetRateLimit } from '@/lib/rate-limit';

describe('rate limiter', () => {
  beforeEach(resetRateLimit);

  it('allows up to the limit then blocks', () => {
    for (let i = 0; i < 3; i++) expect(allowRequest('a', 3, 1000, 0)).toBe(true);
    expect(allowRequest('a', 3, 1000, 0)).toBe(false);
  });
  it('tracks callers independently', () => {
    allowRequest('a', 1, 1000, 0);
    expect(allowRequest('a', 1, 1000, 0)).toBe(false);
    expect(allowRequest('b', 1, 1000, 0)).toBe(true);
  });
  it('frees capacity after the window passes', () => {
    allowRequest('a', 1, 1000, 0);
    expect(allowRequest('a', 1, 1000, 500)).toBe(false);
    expect(allowRequest('a', 1, 1000, 1001)).toBe(true);
  });
  it('uses the first forwarded IP as the key', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
    expect(clientKey(new Headers())).toBe('local');
  });
});
