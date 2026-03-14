import { describe, it, expect } from 'vitest';
import { formatOrderNumber } from './order-number';

describe('formatOrderNumber', () => {
  it('formats a standard order number with default prefix', () => {
    expect(formatOrderNumber(1001)).toBe('SD-1001');
  });

  it('pads numbers to 4 digits', () => {
    expect(formatOrderNumber(1)).toBe('SD-0001');
    expect(formatOrderNumber(42)).toBe('SD-0042');
    expect(formatOrderNumber(999)).toBe('SD-0999');
  });

  it('does not truncate numbers longer than 4 digits', () => {
    expect(formatOrderNumber(12345)).toBe('SD-12345');
    expect(formatOrderNumber(100000)).toBe('SD-100000');
  });

  it('handles zero', () => {
    expect(formatOrderNumber(0)).toBe('SD-0000');
  });

  it('uses a custom prefix when provided', () => {
    expect(formatOrderNumber(1, 'ORD')).toBe('ORD-0001');
    expect(formatOrderNumber(5678, 'BK')).toBe('BK-5678');
  });

  it('uses default prefix when prefix is undefined', () => {
    expect(formatOrderNumber(10, undefined)).toBe('SD-0010');
  });
});
