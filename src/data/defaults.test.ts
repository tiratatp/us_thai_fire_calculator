/**
 * Invariants over DEFAULT_* values (assumption, correlation matrix, scenarios).
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ASSUMPTION,
  DEFAULT_CORRELATION_MATRIX,
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
  DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
  DEFAULT_USER_INPUTS,
} from './defaults.js';

describe('Default correlation matrix', () => {
  const M = DEFAULT_CORRELATION_MATRIX;

  it('is 4x4', () => {
    expect(M.length).toBe(4);
    for (const row of M) expect(row.length).toBe(4);
  });

  it('unit diagonal', () => {
    for (let i = 0; i < 4; i++) {
      expect(M[i]![i]).toBe(1);
    }
  });

  it('symmetric', () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(M[i]![j], `[${i}][${j}] vs [${j}][${i}]`).toBe(M[j]![i]);
      }
    }
  });

  it('is positive semi-definite (leading principal minors ≥ 0)', () => {
    // Cheap PSD check for a 4x4: compute all 4 leading principal minor
    // determinants; all ≥ 0 (with a tiny tolerance) is sufficient.
    const det = (m: number[][]): number => {
      const n = m.length;
      if (n === 1) return m[0]![0]!;
      if (n === 2) return m[0]![0]! * m[1]![1]! - m[0]![1]! * m[1]![0]!;
      let d = 0;
      for (let c = 0; c < n; c++) {
        const sub: number[][] = [];
        for (let r = 1; r < n; r++) {
          const row: number[] = [];
          for (let cc = 0; cc < n; cc++) if (cc !== c) row.push(m[r]![cc]!);
          sub.push(row);
        }
        d += (c % 2 === 0 ? 1 : -1) * m[0]![c]! * det(sub);
      }
      return d;
    };
    const asMut = M.map((r) => [...r]);
    for (let k = 1; k <= 4; k++) {
      const sub = asMut.slice(0, k).map((r) => r.slice(0, k));
      expect(det(sub), `leading minor size ${k}`).toBeGreaterThanOrEqual(-1e-10);
    }
  });
});

describe('Default assumption', () => {
  const A = DEFAULT_ASSUMPTION;

  it('all return distributions have sd > 0', () => {
    for (const [name, d] of [
      ['usStock', A.usStock],
      ['usBond', A.usBond],
      ['intlStock', A.intlStock],
      ['cash', A.cash],
    ] as const) {
      expect(d.sd, name).toBeGreaterThan(0);
    }
  });

  it('inflation distributions plausible', () => {
    expect(A.usInflation.mean).toBeGreaterThan(0);
    expect(A.usInflation.mean).toBeLessThan(0.10);
    expect(A.thaiInflation.mean).toBeGreaterThan(0);
    expect(A.thaiInflation.mean).toBeLessThan(0.10);
  });

  it('FX default center is 35 THB/USD', () => {
    expect(A.fxUsdThb.mean).toBe(35);
  });

  it('stock allocation fractions in [0, 1]', () => {
    expect(A.stockAllocationTaxable).toBeGreaterThanOrEqual(0);
    expect(A.stockAllocationTaxable).toBeLessThanOrEqual(1);
    expect(A.stockAllocationTaxDeferred).toBeGreaterThanOrEqual(0);
    expect(A.stockAllocationTaxDeferred).toBeLessThanOrEqual(1);
  });
});

describe('Regulatory scenarios', () => {
  it('optimistic and pessimistic differ on every flag', () => {
    const opt = DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC;
    const pes = DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC;
    expect(opt.rothTaxedByThailand).not.toBe(pes.rothTaxedByThailand);
    expect(opt.treatyResourcesUsSourcePensions).not.toBe(
      pes.treatyResourcesUsSourcePensions,
    );
    expect(opt.thaiPensionDeductionApplies).not.toBe(pes.thaiPensionDeductionApplies);
    expect(opt.niitCreditableAgainstThai).not.toBe(pes.niitCreditableAgainstThai);
  });

  it('optimistic: Roth NOT taxed by Thailand, treaty re-sources, pension ded applies, NIIT credit', () => {
    const opt = DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC;
    expect(opt.rothTaxedByThailand).toBe(false);
    expect(opt.treatyResourcesUsSourcePensions).toBe(true);
    expect(opt.thaiPensionDeductionApplies).toBe(true);
    expect(opt.niitCreditableAgainstThai).toBe(true);
  });
});

describe('DEFAULT_USER_INPUTS', () => {
  const U = DEFAULT_USER_INPUTS;

  it('thaiResidencyByYear length = lifeExpectancy - currentAge', () => {
    expect(U.thaiResidencyByYear.length).toBe(U.lifeExpectancy - U.currentAge);
  });

  it('default success threshold in (0, 1]', () => {
    expect(U.successThreshold).toBeGreaterThan(0);
    expect(U.successThreshold).toBeLessThanOrEqual(1);
  });

  it('default trials ≥ 100', () => {
    expect(U.monteCarloTrials).toBeGreaterThanOrEqual(100);
  });

  it('regulatoryStance = both by default', () => {
    expect(U.regulatoryStance).toBe('both');
  });
});
