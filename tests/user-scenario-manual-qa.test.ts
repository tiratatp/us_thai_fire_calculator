/**
 * Manual QA equivalent: runs the exact worker code path the browser
 * invokes on form submit, with the user's exact inputs. Verifies the
 * year-by-year table would render many rows (not 4 or 6), and that the
 * withdrawal chart would show non-zero values in most years.
 *
 * This is what actually happens end-to-end in the deployed app.
 */
import { describe, it, expect } from 'vitest';
import { runBothRegulatoryScenarios } from '../src/engine/monte-carlo.js';
import { buildRow } from '../src/ui/year-table.js';
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
  monteCarloTrials: 200,
  regulatoryStance: 'both',
};

describe('End-to-end user-facing QA', () => {
  it('year-by-year table can render at least 20 rows for the user inputs', () => {
    const { pessimistic } = runBothRegulatoryScenarios(
      userInputs,
      DEFAULT_ASSUMPTION,
      12345,
      200,
    );
    const rows = pessimistic.p50.map(buildRow);
    expect(rows.length).toBeGreaterThanOrEqual(20);
    for (const row of rows) {
      expect(row.cells.length).toBe(10);
      expect(row.cells[0]).toMatch(/Year \d+ \(Age \d+\)/);
    }
  });

  it('withdrawal chart data is non-zero in the majority of years after THB Cash depletes', () => {
    const { pessimistic } = runBothRegulatoryScenarios(
      userInputs,
      DEFAULT_ASSUMPTION,
      12345,
      200,
    );
    const nonZeroYears = pessimistic.p50.filter(
      (o) => o.remittances.reduce((s, r) => s + r.amountUsd, 0) > 0,
    ).length;
    expect(nonZeroYears).toBeGreaterThanOrEqual(pessimistic.p50.length - 6);
  });
});
