/**
 * Regression tests for the "Thai tax must be fundable via remittance"
 * fixed-point behavior. Oracle-approved design per
 * `.research/08-algorithm-v2.md` Step 8: "If insufficient cash, may force
 * additional withdrawal → recurse or clamp."
 *
 * Symptom before the fix: a Thai-resident year where THB Cash is depleted
 * by baseline expenses would report `spendingMet=false` even when USD
 * accounts had millions available, because the old `payThaiTax` only
 * drained THB Cash and had no path to remit USD → THB for tax.
 *
 * The fix: fold Thai tax into `thbNeed` and iterate `fundThb`→`computeThaiTax`
 * to a fixed point. When the tax-funding remittance is itself assessable
 * (Cash post-2024, gains, retirement) the iteration converges to the
 * tax-on-tax equilibrium. When it's not assessable (basis, pre-2024 Cash)
 * there's no tax-on-tax and it converges in one pass.
 */

import { describe, it, expect } from 'vitest';
import { yearStep, type YearState } from './drawdown.js';
import {
  DEFAULT_ASSUMPTION,
  DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
} from '../data/defaults.js';

const NEUTRAL_SHOCKS = {
  stockReturn: 0.06,
  bondReturn: 0.04,
  intlReturn: 0.06,
  cashReturn: 0.035,
  usInflation: 0.03,
  thaiInflation: 0.02,
  fxLogShockZ: 0,
};

describe('Thai tax must be fundable via remittance (fixed-point)', () => {
  it('year with depleted THB Cash + assessable remittance succeeds using USD accounts', () => {
    // Reproduces the user-reported bug: year 5 (age 42) after 4 years of
    // drawing THB Cash to fund baseline expenses. THB Cash is nearly empty
    // but $1.5M in TaxableBrokerage remains — spendingMet MUST be true.
    const state: YearState = {
      year: 5,
      age: 42,
      birthYear: 1989,
      accounts: [
        { id: 'a1', type: 'Cash', currency: 'THB', balance: 389_927 },
        { id: 'a2', type: 'Cash', currency: 'USD', balance: 59_757 },
        {
          id: 'a3',
          type: 'TaxableBrokerage',
          currency: 'USD',
          balance: 1_556_165,
          basis: 1_000_000,
        },
        { id: 'a4', type: 'Traditional401k', currency: 'USD', balance: 326_951 },
        { id: 'a5', type: 'Roth401k', currency: 'USD', balance: 292_808 },
        { id: 'a6', type: 'TraditionalIRA', currency: 'USD', balance: 55_681 },
        { id: 'a7', type: 'RothIRA', currency: 'USD', balance: 63_371 },
        { id: 'a8', type: 'HSA', currency: 'USD', balance: 68_056 },
      ],
      fxRateUsdThb: 38.36,
      cumulativeUsTaxPaid: 0,
      cumulativeThaiTaxPaid: 0,
      failed: false,
    };
    const { outcome, state: next } = yearStep({
      state,
      shocks: NEUTRAL_SHOCKS,
      baseExpensesThbMo: 165_000, // 80+27+13+45
      baseExpensesThbYr: 118_000, // 110+8
      baseTravelUsdYr: 20_000,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.spendingMet).toBe(true);
    expect(next.failed).toBe(false);
    // The remittance from USD Cash + TaxableBrokerage must fund BOTH the
    // baseline expenses AND the Thai tax it generates.
    expect(outcome.thaiTax).toBeGreaterThan(0);
    // No account should be negative.
    for (const bal of Object.values(outcome.balancesByAccount)) {
      expect(bal).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it('tax-on-tax converges: total remitted covers both base need AND Thai tax on that remittance', () => {
    // Set up a scenario where THB Cash is zero and everything must be
    // remitted from post-2024 USD Cash (fully assessable under both
    // regulatory scenarios). The remittance itself is fully taxable, so
    // the fixed point must remit an extra amount to cover the tax on the
    // remittance, and that extra amount is itself taxable, etc. — the
    // converged total tax should equal computeThaiTax(remittance items).
    const state: YearState = {
      year: 0,
      age: 45,
      birthYear: 1980,
      accounts: [
        { id: 'thb', type: 'Cash', currency: 'THB', balance: 0 },
        { id: 'usd', type: 'Cash', currency: 'USD', balance: 500_000 },
      ],
      fxRateUsdThb: 35,
      cumulativeUsTaxPaid: 0,
      cumulativeThaiTaxPaid: 0,
      failed: false,
    };
    const { outcome } = yearStep({
      state,
      shocks: { ...NEUTRAL_SHOCKS, thaiInflation: 0, usInflation: 0 },
      baseExpensesThbMo: 100_000, // 1.2M THB/yr baseline
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.spendingMet).toBe(true);
    // Total remitted THB (from items) must equal base need + Thai tax
    // (within a small tolerance from the fixed-point convergence).
    const totalRemitThb = outcome.remittances.reduce(
      (s, r) => s + r.amountThb,
      0,
    );
    const baseNeedThb = 100_000 * 12; // 1_200_000
    expect(totalRemitThb).toBeGreaterThanOrEqual(baseNeedThb + outcome.thaiTax - 5);
    expect(totalRemitThb).toBeLessThanOrEqual(baseNeedThb + outcome.thaiTax + 5);
  });

  it('non-assessable funding (pre-2024 Cash + basis): no tax-on-tax, one-shot convergence', () => {
    // A user with only pre-2024 grandfathered USD Cash and TaxableBrokerage
    // basis (both assessable = 0) should generate ZERO Thai tax on the
    // remittance, so the fixed point converges in one iteration.
    const state: YearState = {
      year: 0,
      age: 45,
      birthYear: 1980,
      accounts: [
        { id: 'thb', type: 'Cash', currency: 'THB', balance: 0 },
        {
          id: 'usd',
          type: 'Cash',
          currency: 'USD',
          balance: 500_000,
          pre2024Snapshot: 500_000,
        },
      ],
      fxRateUsdThb: 35,
      cumulativeUsTaxPaid: 0,
      cumulativeThaiTaxPaid: 0,
      failed: false,
    };
    const { outcome } = yearStep({
      state,
      shocks: { ...NEUTRAL_SHOCKS, thaiInflation: 0, usInflation: 0 },
      baseExpensesThbMo: 100_000,
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.spendingMet).toBe(true);
    expect(outcome.thaiTax).toBe(0);
    // Pre-2024 Cash remittance amountThb ≈ base need; no tax overhead.
    const totalRemitThb = outcome.remittances.reduce(
      (s, r) => s + r.amountThb,
      0,
    );
    expect(totalRemitThb).toBeGreaterThanOrEqual(1_200_000 - 5);
    expect(totalRemitThb).toBeLessThanOrEqual(1_200_000 + 5);
  });

  it('non-resident year: no Thai tax computed → no augmentation → single-pass funding', () => {
    // In a non-resident year, computeThaiTax short-circuits to 0. The
    // fixed-point loop should converge immediately and behave identically
    // to the pre-fix code for baseline expenses only.
    const state: YearState = {
      year: 0,
      age: 45,
      birthYear: 1980,
      accounts: [
        { id: 'thb', type: 'Cash', currency: 'THB', balance: 0 },
        { id: 'usd', type: 'Cash', currency: 'USD', balance: 500_000 },
      ],
      fxRateUsdThb: 35,
      cumulativeUsTaxPaid: 0,
      cumulativeThaiTaxPaid: 0,
      failed: false,
    };
    const { outcome } = yearStep({
      state,
      shocks: { ...NEUTRAL_SHOCKS, thaiInflation: 0, usInflation: 0 },
      baseExpensesThbMo: 100_000,
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: false,
      regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.spendingMet).toBe(true);
    expect(outcome.thaiTax).toBe(0);
  });

  it('genuine insolvency: portfolio too small — spendingMet=false, failed=true', () => {
    // If the portfolio truly cannot fund base need + tax, the fix must
    // still report unmet. The fix must not mask real insolvency.
    const state: YearState = {
      year: 0,
      age: 45,
      birthYear: 1980,
      accounts: [
        { id: 'thb', type: 'Cash', currency: 'THB', balance: 100_000 },
        { id: 'usd', type: 'Cash', currency: 'USD', balance: 10_000 },
      ],
      fxRateUsdThb: 35,
      cumulativeUsTaxPaid: 0,
      cumulativeThaiTaxPaid: 0,
      failed: false,
    };
    const { outcome, state: next } = yearStep({
      state,
      shocks: { ...NEUTRAL_SHOCKS, thaiInflation: 0, usInflation: 0 },
      baseExpensesThbMo: 100_000, // 1.2M THB/yr need, only 100k THB + $10k USD available
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.spendingMet).toBe(false);
    expect(next.failed).toBe(true);
  });
});
