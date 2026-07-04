/**
 * Tests for USD/THB FX log-normal random walk.
 */

import { describe, it, expect } from 'vitest';
import { stepFx } from './fx.js';
import { mulberry32, normalPair } from './prng.js';
import type { FxModel } from '../types.js';

const NEUTRAL: FxModel = { mean: 35, sdAnnualLog: 0.08, meanReversion: 0 };

describe('stepFx', () => {
  it('is deterministic', () => {
    const a = stepFx(35, 0.5, NEUTRAL);
    const b = stepFx(35, 0.5, NEUTRAL);
    expect(a).toBe(b);
  });

  it('returns the same rate when shock=0 and meanReversion=0', () => {
    expect(stepFx(35, 0, NEUTRAL)).toBeCloseTo(35, 10);
    expect(stepFx(42.7, 0, NEUTRAL)).toBeCloseTo(42.7, 10);
  });

  it('increases when shockZ > 0 and decreases when shockZ < 0', () => {
    const up = stepFx(35, 1, NEUTRAL);
    const down = stepFx(35, -1, NEUTRAL);
    expect(up).toBeGreaterThan(35);
    expect(down).toBeLessThan(35);
  });

  it('always returns a positive rate (log-normal cannot cross zero)', () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 1000; i++) {
      const [z] = normalPair(rng);
      const next = stepFx(35, z, NEUTRAL);
      expect(next).toBeGreaterThan(0);
      expect(Number.isFinite(next)).toBe(true);
    }
  });

  it('pulls toward mean when meanReversion > 0 (shock=0, below mean)', () => {
    const model: FxModel = { mean: 35, sdAnnualLog: 0.08, meanReversion: 1 };
    const next = stepFx(30, 0, model);
    expect(next).toBeGreaterThan(30);
    expect(next).toBeLessThanOrEqual(35 + 1e-9);
  });

  it('pulls toward mean when meanReversion > 0 (shock=0, above mean)', () => {
    const model: FxModel = { mean: 35, sdAnnualLog: 0.08, meanReversion: 1 };
    const next = stepFx(40, 0, model);
    expect(next).toBeLessThan(40);
    expect(next).toBeGreaterThanOrEqual(35 - 1e-9);
  });

  it('scales shock with sqrt(dt)', () => {
    // Two half-steps under pure diffusion should have variance ≈ one full step.
    const oneStep = Math.log(stepFx(35, 1, NEUTRAL, 1) / 35);
    const halfStep = Math.log(stepFx(35, 1, NEUTRAL, 0.5) / 35);
    // sqrt(0.5) ≈ 0.707
    expect(halfStep / oneStep).toBeCloseTo(Math.sqrt(0.5), 6);
  });

  it('long-run mean of log(rate) converges to log(mean) under mean reversion', () => {
    const model: FxModel = { mean: 35, sdAnnualLog: 0.05, meanReversion: 0.3 };
    const rng = mulberry32(2026);
    let rate = 35;
    const logs: number[] = [];
    // Burn-in.
    for (let i = 0; i < 1000; i++) {
      const [z] = normalPair(rng);
      rate = stepFx(rate, z, model);
    }
    // Sample.
    for (let i = 0; i < 10_000; i++) {
      const [z] = normalPair(rng);
      rate = stepFx(rate, z, model);
      logs.push(Math.log(rate));
    }
    const mean = logs.reduce((s, x) => s + x, 0) / logs.length;
    expect(Math.abs(mean - Math.log(35))).toBeLessThan(0.05);
  });
});
