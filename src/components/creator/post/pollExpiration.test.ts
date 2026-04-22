import { describe, it, expect } from 'vitest';
import { computePollClosesAt, isPollExpired } from './PollCreator';

describe('computePollClosesAt', () => {
  it('returns startedAt + durationMs', () => {
    const startedAt = 1_700_000_000_000;
    const durationMs = 60 * 60 * 1000;
    expect(computePollClosesAt(startedAt, durationMs)).toBe(startedAt + durationMs);
  });

  it('handles zero duration', () => {
    expect(computePollClosesAt(1000, 0)).toBe(1000);
  });
});

describe('isPollExpired', () => {
  it('returns false when closesAt is undefined', () => {
    expect(isPollExpired(undefined, 1000)).toBe(false);
  });

  it('returns false when now < closesAt', () => {
    expect(isPollExpired(2000, 1000)).toBe(false);
  });

  it('returns true when now > closesAt', () => {
    expect(isPollExpired(1000, 2000)).toBe(true);
  });

  it('returns true at the boundary (now === closesAt)', () => {
    expect(isPollExpired(1000, 1000)).toBe(true);
  });
});
