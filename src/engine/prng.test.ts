/**
 * Tests for mulberry32 PRNG + Box-Muller normal pairs.
 *
 * See .research/05-monte-carlo.md §10 for algorithm sources.
 */

import { describe, it, expect } from 'vitest';
import { mulberry32, normalPair } from './prng.js';

describe('mulberry32', () => {
  it('is deterministic under identical seed', () => {
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(r1()).toBe(r2());
    }
  });

  it('produces different sequences for different seeds', () => {
    const r1 = mulberry32(1);
    const r2 = mulberry32(2);
    let anyDifferent = false;
    for (let i = 0; i < 10; i++) {
      if (r1() !== r2()) anyDifferent = true;
    }
    expect(anyDifferent).toBe(true);
  });

  it('outputs values strictly in [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('has mean within [0.49, 0.51] across 10k samples', () => {
    const rng = mulberry32(7);
    let sum = 0;
    const n = 10_000;
    for (let i = 0; i < n; i++) sum += rng();
    const mean = sum / n;
    expect(mean).toBeGreaterThan(0.49);
    expect(mean).toBeLessThan(0.51);
  });

  it('handles seed 0 without collapsing to a constant', () => {
    const rng = mulberry32(0);
    const first = rng();
    const second = rng();
    expect(first).not.toBe(second);
  });
});

describe('normalPair (Box-Muller)', () => {
  it('is deterministic when the underlying rng is deterministic', () => {
    const [a1, b1] = normalPair(mulberry32(99));
    const [a2, b2] = normalPair(mulberry32(99));
    expect(a1).toBe(a2);
    expect(b1).toBe(b2);
  });

  it('produces finite numbers (never NaN or ±Infinity)', () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 1000; i++) {
      const [a, b] = normalPair(rng);
      expect(Number.isFinite(a)).toBe(true);
      expect(Number.isFinite(b)).toBe(true);
    }
  });

  it('has sample mean ≈ 0 and sd ≈ 1 across 10k pairs', () => {
    const rng = mulberry32(2026);
    const samples: number[] = [];
    for (let i = 0; i < 5_000; i++) {
      const [a, b] = normalPair(rng);
      samples.push(a, b);
    }
    const n = samples.length;
    const mean = samples.reduce((s, x) => s + x, 0) / n;
    const variance =
      samples.reduce((s, x) => s + (x - mean) * (x - mean), 0) / n;
    const sd = Math.sqrt(variance);
    expect(mean).toBeGreaterThan(-0.05);
    expect(mean).toBeLessThan(0.05);
    expect(sd).toBeGreaterThan(0.95);
    expect(sd).toBeLessThan(1.05);
  });
});
