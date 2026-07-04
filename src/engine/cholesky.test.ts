/**
 * Tests for Cholesky decomposition + correlated multivariate normal draws.
 *
 * See .research/05-monte-carlo.md §2 (correlation matrix) and §10 (draws).
 */

import { describe, it, expect } from 'vitest';
import { choleskyDecompose, correlatedDraws } from './cholesky.js';
import { mulberry32, normalPair } from './prng.js';
import { DEFAULT_CORRELATION_MATRIX } from '../data/defaults.js';

/** Multiply L · Lᵀ into a fresh n×n matrix. */
function multiplyLLT(L: readonly (readonly number[])[]): number[][] {
  const n = L.length;
  const out: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k <= Math.min(i, j); k++) s += L[i]![k]! * L[j]![k]!;
      out[i]![j] = s;
    }
  }
  return out;
}

describe('choleskyDecompose', () => {
  it('reconstructs the DEFAULT_CORRELATION_MATRIX within 1e-10', () => {
    const M = DEFAULT_CORRELATION_MATRIX;
    const L = choleskyDecompose(M);
    const reconstructed = multiplyLLT(L);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(Math.abs(reconstructed[i]![j]! - M[i]![j]!)).toBeLessThan(1e-10);
      }
    }
  });

  it('produces a lower-triangular matrix with non-negative diagonals', () => {
    const L = choleskyDecompose(DEFAULT_CORRELATION_MATRIX);
    for (let i = 0; i < L.length; i++) {
      expect(L[i]![i]!).toBeGreaterThanOrEqual(0);
      for (let j = i + 1; j < L.length; j++) {
        expect(L[i]![j]!).toBe(0);
      }
    }
  });

  it('handles the identity matrix (should return identity)', () => {
    const I = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const L = choleskyDecompose(I);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(L[i]![j]!).toBe(i === j ? 1 : 0);
      }
    }
  });

  it('rejects a non-PSD matrix', () => {
    // [[1, 2], [2, 1]] has eigenvalues 3 and -1 — not PSD.
    expect(() =>
      choleskyDecompose([
        [1, 2],
        [2, 1],
      ]),
    ).toThrow(/PSD/i);
  });
});

describe('correlatedDraws', () => {
  it('is deterministic', () => {
    const L = choleskyDecompose(DEFAULT_CORRELATION_MATRIX);
    const indep = [0.1, -0.3, 1.2, 0.5];
    const a = correlatedDraws(L, indep);
    const b = correlatedDraws(L, indep);
    expect(a).toEqual(b);
  });

  it('preserves independent draws when L = identity', () => {
    const I = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const L = choleskyDecompose(I);
    const indep = [0.7, -1.4, 2.1];
    expect(correlatedDraws(L, indep)).toEqual(indep);
  });

  it('recovers the target correlation matrix within ±0.02 over 100k samples', () => {
    const M = DEFAULT_CORRELATION_MATRIX;
    const L = choleskyDecompose(M);
    const n = 100_000;
    const rng = mulberry32(20260704);

    // Draw n independent 4-vectors of N(0,1), transform to correlated.
    const dim = 4;
    const samples: number[][] = Array.from({ length: dim }, () =>
      new Array(n).fill(0),
    );
    for (let s = 0; s < n; s++) {
      // Need 4 independent normals; consume 2 Box-Muller pairs.
      const [z0, z1] = normalPair(rng);
      const [z2, z3] = normalPair(rng);
      const correlated = correlatedDraws(L, [z0, z1, z2, z3]);
      for (let d = 0; d < dim; d++) samples[d]![s] = correlated[d]!;
    }

    // Compute mean and sd per dimension.
    const means = samples.map((col) => col.reduce((a, b) => a + b, 0) / n);
    const sds = samples.map((col, d) => {
      const m = means[d]!;
      const v = col.reduce((a, x) => a + (x - m) * (x - m), 0) / n;
      return Math.sqrt(v);
    });

    // Recover correlation and compare to input.
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const mi = means[i]!;
        const mj = means[j]!;
        let cov = 0;
        for (let s = 0; s < n; s++) {
          cov += (samples[i]![s]! - mi) * (samples[j]![s]! - mj);
        }
        cov /= n;
        const corr = cov / (sds[i]! * sds[j]!);
        expect(Math.abs(corr - M[i]![j]!)).toBeLessThan(0.02);
      }
    }
  });
});
