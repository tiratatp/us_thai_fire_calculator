/**
 * Tests for Thai PIT engine.
 *
 * Anchors:
 * - .research/02-thai-tax.md §4 (source-type taxability)
 * - .research/08-algorithm-v2.md (per-item assessable rules)
 * - Oracle Systemic #4 (grandfathering does NOT apply to retirement accounts)
 * - Oracle D3 canonical example (pension deduction path → 262,500 THB)
 * - .omo/plans/v1-work-plan.md §T5 QA scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  isPensionSourceType,
  thaiAssessableFromRemittance,
  thaiPit,
  thaiTaxOnRemittances,
} from './thai-tax.js';
import type {
  RegulatoryScenario,
  RemittanceItem,
  RemittanceSourceType,
} from '../types.js';
import { THAI_PIT_BRACKETS } from '../data/constants.js';

const BRACKETS = THAI_PIT_BRACKETS.value;

const OPTIMISTIC: RegulatoryScenario = {
  rothTaxedByThailand: false,
  treatyResourcesUsSourcePensions: true,
  thaiPensionDeductionApplies: true,
  niitCreditableAgainstThai: true,
};

const PESSIMISTIC: RegulatoryScenario = {
  rothTaxedByThailand: true,
  treatyResourcesUsSourcePensions: false,
  thaiPensionDeductionApplies: false,
  niitCreditableAgainstThai: false,
};

function item(
  sourceType: RemittanceSourceType,
  amountThb: number,
  preTaxOrigin: 'pre2024' | 'post2024' = 'post2024',
): RemittanceItem {
  return {
    sourceAccountId: 'acct-1',
    amountUsd: amountThb / 35,
    amountThb,
    assessablePortionThb: amountThb,
    sourceType,
    preTaxOrigin,
  };
}

describe('thaiPit — progressive bracket application', () => {
  it('returns 0 for 0 income', () => {
    expect(thaiPit(0, BRACKETS)).toBe(0);
  });

  it('returns 0 for income at top of first (0%) bracket', () => {
    expect(thaiPit(150000, BRACKETS)).toBe(0);
  });

  it('boundary 500,001 THB → 27,500.15 (0 + 7500 + 20000 + 0.15)', () => {
    // 0-150k @ 0% = 0
    // 150k-300k @ 5% = 7500
    // 300k-500k @ 10% = 20000
    // 500k-500,001 @ 15% = 0.15
    expect(thaiPit(500001, BRACKETS)).toBeCloseTo(27500.15, 6);
  });

  it('exactly at 300,000 → 7500 (0 + 5% × 150k)', () => {
    expect(thaiPit(300000, BRACKETS)).toBeCloseTo(7500, 6);
  });

  it('applies bracket-by-bracket for 1,590,000 THB', () => {
    // 0-150k = 0
    // 150k-300k × 5% = 7,500
    // 300k-500k × 10% = 20,000
    // 500k-750k × 15% = 37,500
    // 750k-1M × 20% = 50,000
    // 1M-1.59M × 25% = 147,500
    // = 262,500
    expect(thaiPit(1590000, BRACKETS)).toBeCloseTo(262500, 6);
  });
});

describe('isPensionSourceType', () => {
  it('is true for TraditionalIRA / Roth / HSA', () => {
    expect(isPensionSourceType('TraditionalIRA')).toBe(true);
    expect(isPensionSourceType('Roth')).toBe(true);
    expect(isPensionSourceType('HSA')).toBe(true);
  });

  it('is false for Cash / TaxableBasis / TaxableGain', () => {
    expect(isPensionSourceType('Cash')).toBe(false);
    expect(isPensionSourceType('TaxableBasis')).toBe(false);
    expect(isPensionSourceType('TaxableGain')).toBe(false);
  });
});

describe('thaiAssessableFromRemittance — source-type rules', () => {
  it('Cash pre-2024 origin: grandfathered → 0 assessable', () => {
    expect(
      thaiAssessableFromRemittance(item('Cash', 500000, 'pre2024'), OPTIMISTIC),
    ).toBe(0);
  });

  it('Cash post-2024 origin: fully assessable', () => {
    expect(
      thaiAssessableFromRemittance(item('Cash', 500000, 'post2024'), OPTIMISTIC),
    ).toBe(500000);
  });

  it('TaxableBasis: never assessable (return of capital)', () => {
    expect(
      thaiAssessableFromRemittance(item('TaxableBasis', 400000, 'post2024'), OPTIMISTIC),
    ).toBe(0);
    expect(
      thaiAssessableFromRemittance(item('TaxableBasis', 400000, 'pre2024'), OPTIMISTIC),
    ).toBe(0);
  });

  it('TaxableGain: fully assessable', () => {
    expect(
      thaiAssessableFromRemittance(item('TaxableGain', 100000, 'post2024'), OPTIMISTIC),
    ).toBe(100000);
  });

  it('TraditionalIRA: pre-2024 origin IGNORED (Systemic #4) → fully assessable', () => {
    expect(
      thaiAssessableFromRemittance(
        item('TraditionalIRA', 500000, 'pre2024'),
        OPTIMISTIC,
      ),
    ).toBe(500000);
  });

  it('TraditionalIRA post-2024: fully assessable', () => {
    expect(
      thaiAssessableFromRemittance(
        item('TraditionalIRA', 1750000, 'post2024'),
        OPTIMISTIC,
      ),
    ).toBe(1750000);
  });

  it('Roth optimistic (treaty protects): 0 assessable', () => {
    expect(
      thaiAssessableFromRemittance(item('Roth', 100000, 'post2024'), OPTIMISTIC),
    ).toBe(0);
  });

  it('Roth pessimistic (Thailand taxes): fully assessable, grandfather ignored', () => {
    expect(
      thaiAssessableFromRemittance(item('Roth', 100000, 'pre2024'), PESSIMISTIC),
    ).toBe(100000);
  });

  it('HSA: always assessable in Thailand, grandfather ignored', () => {
    expect(
      thaiAssessableFromRemittance(item('HSA', 50000, 'pre2024'), OPTIMISTIC),
    ).toBe(50000);
  });
});

describe('thaiTaxOnRemittances — top-level', () => {
  it('non-resident short-circuit returns 0 regardless of items', () => {
    const items = [item('TraditionalIRA', 5000000)];
    expect(thaiTaxOnRemittances(items, OPTIMISTIC, false)).toBe(0);
  });

  it('resident with only pre-2024 cash: 0 tax (all grandfathered)', () => {
    const items = [item('Cash', 5000000, 'pre2024')];
    expect(thaiTaxOnRemittances(items, OPTIMISTIC, true)).toBe(0);
  });

  it('personal allowance: 200k Cash - 60k allowance = 140k → 0 tax', () => {
    const items = [item('Cash', 200000, 'post2024')];
    expect(thaiTaxOnRemittances(items, OPTIMISTIC, true)).toBe(0);
  });

  it('Oracle D3 canonical: 1.75M IRA remittance with pension deduction → 262,500 THB', () => {
    // pension income = 1,750,000
    // pension deduction = min(100k, 0.5 × 1.75M) = 100k
    // personal allowance = 60k
    // taxable = 1,750,000 - 100,000 - 60,000 = 1,590,000
    // tax on 1,590,000 = 262,500 (see thaiPit test above)
    const items = [item('TraditionalIRA', 1750000)];
    expect(thaiTaxOnRemittances(items, OPTIMISTIC, true)).toBeCloseTo(262500, 4);
  });

  it('pension deduction gated OFF: 1.75M IRA → taxed on 1,690,000', () => {
    // taxable = 1,750,000 - 60,000 = 1,690,000
    // 0 + 7500 + 20000 + 37500 + 50000 + (690,000 × 25%) = 115,000 + 172,500 = 287,500
    const items = [item('TraditionalIRA', 1750000)];
    const scenario: RegulatoryScenario = {
      ...OPTIMISTIC,
      thaiPensionDeductionApplies: false,
    };
    expect(thaiTaxOnRemittances(items, scenario, true)).toBeCloseTo(287500, 4);
  });

  it('pension deduction only applied when pension income > 0', () => {
    // Cash-only remittance; even with pension flag ON, no pension income → no deduction
    const items = [item('Cash', 500000, 'post2024')];
    // taxable = 500,000 - 60,000 = 440,000
    // 0 + 7500 + (140,000 × 10%) = 7500 + 14000 = 21,500
    expect(thaiTaxOnRemittances(items, OPTIMISTIC, true)).toBeCloseTo(21500, 4);
  });
});
