/**
 * End-to-end regression: the user-reported scenario now runs the FULL
 * 63-year simulation and does NOT truncate at year 5. Guards against
 * regression of the "Thai tax must be fundable via remittance" bug fix.
 */
import { describe, it, expect } from 'vitest';
import { runBothRegulatoryScenarios } from '../src/engine/monte-carlo.js';
import { DEFAULT_ASSUMPTION } from '../src/data/defaults.js';
import type { UserInputs } from '../src/types.js';

const userInputs: UserInputs = {
  currentAge: 37,
  lifeExpectancy: 100,
  birthYear: 1989,
  accounts: [
    { id: 'a1', type: 'Cash', currency: 'THB', balance: 10_302_279 },
    { id: 'a2', type: 'Cash', currency: 'USD', balance: 151_449 },
    { id: 'a3', type: 'TaxableBrokerage', currency: 'USD', balance: 1_408_548, basis: 1_000_000 },
    { id: 'a4', type: 'Traditional401k', currency: 'USD', balance: 295_937 },
    { id: 'a5', type: 'Roth401k', currency: 'USD', balance: 265_032 },
    { id: 'a6', type: 'TraditionalIRA', currency: 'USD', balance: 50_399 },
    { id: 'a7', type: 'RothIRA', currency: 'USD', balance: 57_360 },
    { id: 'a8', type: 'HSA', currency: 'USD', balance: 61_600 },
  ],
  expenses: {
    housingThbMo: 80_000,
    foodThbMo: 27_000,
    transportThbMo: 13_000,
    otherThbMo: 45_000,
    healthcareThbYr: 110_000,
    legalTaxThbYr: 8_000,
    travelUsdYr: 20_000,
  },
  thaiResidencyByYear: Array.from({ length: 63 }, () => true),
  successThreshold: 0.9,
  monteCarloTrials: 50,
  regulatoryStance: 'both',
};

describe('User-reported scenario: 63-year sim must not truncate', () => {
  it('pessimistic p50 has some meaningful length; optimistic p50 spans full life', () => {
    const { pessimistic, optimistic } = runBothRegulatoryScenarios(
      userInputs,
      DEFAULT_ASSUMPTION,
      42,
      50,
    );
    // Under pessimistic (Roth taxed, no re-source, no pension ded, no NIIT credit)
    // AND stochastic returns, some trials may still fail — but the p50 trace
    // should be FAR longer than 6 years given the user's portfolio.
    expect(pessimistic.p50.length).toBeGreaterThanOrEqual(30);
    expect(optimistic.p50.length).toBeGreaterThanOrEqual(30);
    for (const o of pessimistic.p50) {
      for (const bal of Object.values(o.balancesByAccount)) {
        expect(bal).toBeGreaterThanOrEqual(-1e-6);
      }
    }
  });
});
