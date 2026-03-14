import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const key = 'test-within-limit';
    const limit = 3;

    const r1 = rateLimit(key, limit, 60000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, limit, 60000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(key, limit, 60000);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('rejects requests over the limit', () => {
    const key = 'test-over-limit';
    const limit = 2;

    rateLimit(key, limit, 60000);
    rateLimit(key, limit, 60000);

    const r3 = rateLimit(key, limit, 60000);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('resets after the time window expires', () => {
    const key = 'test-reset';
    const limit = 1;
    const windowMs = 5000;

    const r1 = rateLimit(key, limit, windowMs);
    expect(r1.success).toBe(true);

    const r2 = rateLimit(key, limit, windowMs);
    expect(r2.success).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 1);

    const r3 = rateLimit(key, limit, windowMs);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('tracks different keys independently', () => {
    const limit = 1;

    const r1 = rateLimit('key-a', limit, 60000);
    expect(r1.success).toBe(true);

    const r2 = rateLimit('key-b', limit, 60000);
    expect(r2.success).toBe(true);

    const r3 = rateLimit('key-a', limit, 60000);
    expect(r3.success).toBe(false);
  });
});
