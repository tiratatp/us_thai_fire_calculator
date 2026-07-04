/**
 * US federal tax engine tests (T4).
 *
 * TDD: written BEFORE the implementation. Every scenario listed in
 * `.omo/plans/v1-work-plan.md` §T4 is covered here.
 */

import { describe, expect, it } from 'vitest';

import {
  HSA_MEDICARE_AGE,
  HSA_PRE_65_PENALTY_RATE,
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_RATE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
} from '../data/constants.js';
import {
  usHsaPenalty,
  usLtcgStackTax,
  usNiit,
  usOrdinaryTax,
} from './us-tax.js';

const BRACKETS_2026 = US_ORDINARY_BRACKETS_2026_SINGLE.value;
const LTCG_2026 = US_LTCG_BRACKETS_2026_SINGLE.value;

// ---------- usOrdinaryTax ----------

describe('usOrdinaryTax', () => {
  it('returns 0 for $0 taxable income', () => {
    expect(usOrdinaryTax(0, BRACKETS_2026)).toBe(0);
  });

  it('taxes first-bracket exact top at 10% (2026 single: $12,225 → $1,222.50)', () => {
    // Given: taxable income exactly equals first bracket ceiling.
    // When:  progressive tax is computed.
    // Then:  entire amount taxed at 10%.
    expect(usOrdinaryTax(12225, BRACKETS_2026)).toBeCloseTo(1222.5, 6);
  });

  it('transitions into second bracket at $12,226 (first-bracket + 1 × 12%)', () => {
    // Given: one dollar above first-bracket ceiling.
    // When:  progressive tax is computed.
    // Then:  $12,225 × 10% + $1 × 12% = $1,222.62.
    expect(usOrdinaryTax(12226, BRACKETS_2026)).toBeCloseTo(1222.62, 6);
  });

  it('boundary $49,725 single 2026 = $5,722.50 exactly (Oracle anchor)', () => {
    // Given: taxable income at the second-bracket ceiling.
    // When:  progressive tax is computed.
    // Then:  $12,225 × 10% + $37,500 × 12% = $5,722.50.
    expect(usOrdinaryTax(49725, BRACKETS_2026)).toBeCloseTo(5722.5, 6);
  });

  it('handles the open-ended top bracket (37%)', () => {
    // Given: income well above the last finite ceiling ($644,675).
    // When:  progressive tax is computed.
    // Then:  the excess is taxed at 37%.
    const income = 1_000_000;
    const upToTop =
      12225 * 0.1 +
      (49725 - 12225) * 0.12 +
      (106150 - 49725) * 0.22 +
      (202875 - 106150) * 0.24 +
      (257475 - 202875) * 0.32 +
      (644675 - 257475) * 0.35;
    const above = (income - 644675) * 0.37;
    expect(usOrdinaryTax(income, BRACKETS_2026)).toBeCloseTo(
      upToTop + above,
      6,
    );
  });

  it('rejects negative taxable income by treating as 0', () => {
    expect(usOrdinaryTax(-1000, BRACKETS_2026)).toBe(0);
  });
});

// ---------- usLtcgStackTax ----------

describe('usLtcgStackTax', () => {
  it('all LTCG at 0% when no crowding (ordinary $13,900 + $30k LTCG under $49,450)', () => {
    // Given: ordinary taxable $13,900 leaves 0% room of $35,550.
    // When:  $30,000 LTCG stacked on top.
    // Then:  all $30k at 0% → $0.
    expect(usLtcgStackTax(13900, 30000, LTCG_2026)).toBe(0);
  });

  it('LTCG crowded across 0%→15% boundary ($5,200 @ 0% + $24,800 @ 15% = $3,720)', () => {
    // Given: ordinary $44,250, LTCG $30,000, 0% top $49,450, 15% top $545,500.
    // When:  LTCG stacks on top of ordinary.
    // Then:  $5,200 at 0% + $24,800 at 15% = $3,720.
    expect(usLtcgStackTax(44250, 30000, LTCG_2026)).toBeCloseTo(3720, 6);
  });

  it('LTCG entirely in 20% bracket when ordinary already past 15% top', () => {
    // Given: ordinary $600,000 (past 15% top $545,500), LTCG $100,000.
    // When:  LTCG stacks.
    // Then:  all $100k at 20% = $20,000.
    expect(usLtcgStackTax(600000, 100000, LTCG_2026)).toBeCloseTo(20000, 6);
  });

  it('splits LTCG across 15% and 20% when it straddles the fifteenTop threshold', () => {
    // Given: ordinary $500,000, LTCG $100,000. 0% room = 0. 15% room = 45,500.
    // When:  LTCG stacks.
    // Then:  $45,500 at 15% + $54,500 at 20% = $6,825 + $10,900 = $17,725.
    expect(usLtcgStackTax(500000, 100000, LTCG_2026)).toBeCloseTo(17725, 6);
  });

  it('returns 0 when LTCG amount is 0', () => {
    expect(usLtcgStackTax(100000, 0, LTCG_2026)).toBe(0);
  });

  it('LTCG straddles all three brackets (0% → 15% → 20%)', () => {
    // Given: ordinary $0, LTCG $600,000.
    // When:  LTCG stacks.
    // Then:  $49,450 @ 0% + $496,050 @ 15% + $54,500 @ 20% =
    //        0 + 74,407.50 + 10,900 = 85,307.50.
    expect(usLtcgStackTax(0, 600000, LTCG_2026)).toBeCloseTo(85307.5, 6);
  });
});

// ---------- usNiit ----------

describe('usNiit', () => {
  it('triggers on MAGI $220k / NII $30k → $760', () => {
    // Given: MAGI $220,000, NII $30,000, threshold $200,000.
    // When:  NIIT is computed.
    // Then:  3.8% × min($30,000, $20,000) = $760.
    expect(usNiit(220000, 30000, 200000, 0.038)).toBeCloseTo(760, 6);
  });

  it('returns 0 when MAGI is below the threshold', () => {
    expect(usNiit(150000, 30000)).toBe(0);
  });

  it('returns 0 when MAGI equals the threshold (no excess)', () => {
    expect(usNiit(200000, 50000)).toBe(0);
  });

  it('caps by NII when NII < (MAGI - threshold)', () => {
    // Given: MAGI $500k → excess $300k, NII $10k.
    // When:  NIIT is computed.
    // Then:  3.8% × min($10k, $300k) = 3.8% × $10k = $380.
    expect(usNiit(500000, 10000)).toBeCloseTo(380, 6);
  });

  it('uses cited constants when defaults omitted', () => {
    // Sanity: cited constants match the defaults documented in the plan.
    expect(US_NIIT_RATE.value).toBe(0.038);
    expect(US_NIIT_THRESHOLD_SINGLE.value).toBe(200000);
  });
});

// ---------- usHsaPenalty ----------

describe('usHsaPenalty', () => {
  it('applies 20% penalty on pre-65 non-medical withdrawals ($10k @ 55 → $2,000)', () => {
    expect(usHsaPenalty(10000, 55, false)).toBeCloseTo(2000, 6);
  });

  it('no penalty on post-65 non-medical ($10k @ 70 → $0)', () => {
    expect(usHsaPenalty(10000, 70, false)).toBe(0);
  });

  it('no penalty when withdrawal is a qualified medical expense (any age)', () => {
    expect(usHsaPenalty(10000, 55, true)).toBe(0);
    expect(usHsaPenalty(10000, 70, true)).toBe(0);
  });

  it('boundary: age exactly equals Medicare age (65) → no penalty', () => {
    expect(usHsaPenalty(10000, 65, false)).toBe(0);
  });

  it('penalty rate parameter is respected', () => {
    // Given: a lower hypothetical penalty rate.
    // When:  penalty is computed.
    // Then:  the rate parameter is used verbatim.
    expect(usHsaPenalty(10000, 55, false, 0.1)).toBeCloseTo(1000, 6);
  });

  it('uses cited HSA constants when defaults omitted', () => {
    expect(HSA_PRE_65_PENALTY_RATE.value).toBe(0.2);
    expect(HSA_MEDICARE_AGE.value).toBe(65);
  });

  it('returns 0 when withdrawal amount is 0', () => {
    expect(usHsaPenalty(0, 55, false)).toBe(0);
  });
});
