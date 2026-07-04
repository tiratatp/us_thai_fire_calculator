/**
 * Remittance solver tests — `solveRemittance` (T8). TDD-first.
 *
 * Anchor: plan §T8 QA + Oracle Systemic #4 (no grandfather for retirement).
 */
import { describe, expect, it } from 'vitest';
import type { Account } from '../types.js';
import { solveRemittance, type FundingSource } from './remittance.js';

function usdAccount(overrides: Partial<Account> = {}): Account {
  return { id: 'default', type: 'Cash', currency: 'USD', balance: 100000, ...overrides };
}

describe('solveRemittance', () => {
  it('returns spendingUnmet when there are no US sources', () => {
    const res = solveRemittance(300000, [], 35, true);
    expect(res.spendingUnmet).toBe(true);
    expect(res.shortfallThb).toBe(300000);
    expect(res.items).toHaveLength(0);
    expect(res.totalRemittedUsd).toBe(0);
    expect(res.totalRemittedThb).toBe(0);
  });

  it('orders sources cheapest-first: Cash → Basis → Gain → Traditional', () => {
    const sources: FundingSource[] = [
      { accountId: 'trad', sourceType: 'TraditionalIRA', availableUsd: 30000, isPre2024: false },
      { accountId: 'gain', sourceType: 'TaxableGain', availableUsd: 5000, isPre2024: false },
      { accountId: 'basis', sourceType: 'TaxableBasis', availableUsd: 5000, isPre2024: false },
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 10000, isPre2024: false },
    ];
    const res = solveRemittance(40000 * 35, sources, 35, true);
    expect(res.spendingUnmet).toBe(false);
    expect(res.items.map((i) => i.sourceType)).toEqual([
      'Cash', 'TaxableBasis', 'TaxableGain', 'TraditionalIRA',
    ]);
    expect(res.items[0]?.amountUsd).toBeCloseTo(10000, 6);
    expect(res.items[3]?.amountUsd).toBeCloseTo(20000, 6);
    expect(res.totalRemittedUsd).toBeCloseTo(40000, 6);
  });

  it('Systemic #4: pre-2024 flag ignored for TraditionalIRA', () => {
    const sources: FundingSource[] = [
      { accountId: 'trad', sourceType: 'TraditionalIRA', availableUsd: 50000, isPre2024: true },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.sourceType).toBe('TraditionalIRA');
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
    expect(item?.preTaxOrigin).toBe('post2024');
  });

  it('honors Cash pre-2024 grandfather (assessable = 0)', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 20000, isPre2024: true },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    expect(res.items[0]?.assessablePortionThb).toBe(0);
    expect(res.items[0]?.preTaxOrigin).toBe('pre2024');
  });

  it('Cash post-2024 is fully assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 20000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
  });

  it('TaxableBasis is never assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'b', sourceType: 'TaxableBasis', availableUsd: 20000, isPre2024: false },
    ];
    expect(
      solveRemittance(10000 * 35, sources, 35, true).items[0]?.assessablePortionThb,
    ).toBe(0);
  });

  it('TaxableGain is fully assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'g', sourceType: 'TaxableGain', availableUsd: 20000, isPre2024: false },
    ];
    const item = solveRemittance(10000 * 35, sources, 35, true).items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
  });

  it('Roth is fully assessable at solver layer (regulatory zeroing lives in thai-tax.ts)', () => {
    const sources: FundingSource[] = [
      { accountId: 'roth', sourceType: 'Roth', availableUsd: 20000, isPre2024: false },
    ];
    const item = solveRemittance(10000 * 35, sources, 35, true).items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
  });

  it('non-resident year still emits items (short-circuit lives in thai-tax.ts)', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 1000, isPre2024: false },
    ];
    const res = solveRemittance(1000, sources, 35, false);
    expect(res.items).toHaveLength(1);
    expect(res.spendingUnmet).toBe(false);
  });

  it('spendingUnmet=true when balances cannot cover need', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 1000, isPre2024: false },
    ];
    const res = solveRemittance(5_000_000, sources, 35, true);
    expect(res.spendingUnmet).toBe(true);
    expect(res.shortfallThb).toBeGreaterThan(0);
    expect(res.totalRemittedThb).toBeCloseTo(1000 * 35, 3);
  });

  it('exact match: single source covers the need with no shortfall', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 10000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    expect(res.spendingUnmet).toBe(false);
    expect(res.shortfallThb).toBe(0);
    expect(res.items).toHaveLength(1);
    expect(res.totalRemittedUsd).toBeCloseTo(10000, 6);
  });
});

// Anchor helper re-used by remittance.build.test.ts via import.
export { usdAccount };
