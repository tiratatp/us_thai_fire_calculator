/**
 * Remittance solver tests (T8). TDD: written BEFORE the impl.
 * Anchor: plan §T8 QA scenarios + Oracle "Systemic #4" (no grandfather
 * for retirement accounts).
 */
import { describe, expect, it } from 'vitest';
import type { Account } from '../types.js';
import {
  buildFundingSources,
  solveRemittance,
  sourceOrder,
  sourceOrderIndex,
  splitTaxableLot,
  type FundingSource,
} from './remittance.js';

function usdAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'default',
    type: 'Cash',
    currency: 'USD',
    balance: 100000,
    ...overrides,
  };
}

describe('sourceOrder', () => {
  it('fixes the preference order Cash → TaxableBasis → TaxableGain → Traditional → Roth → HSA', () => {
    expect(sourceOrder()).toEqual([
      'Cash',
      'TaxableBasis',
      'TaxableGain',
      'TraditionalIRA',
      'Roth',
      'HSA',
    ]);
  });

  it('sourceOrderIndex returns strictly ascending indices matching sourceOrder', () => {
    expect(sourceOrderIndex('Cash')).toBe(0);
    expect(sourceOrderIndex('TaxableBasis')).toBe(1);
    expect(sourceOrderIndex('TaxableGain')).toBe(2);
    expect(sourceOrderIndex('TraditionalIRA')).toBe(3);
    expect(sourceOrderIndex('Roth')).toBe(4);
    expect(sourceOrderIndex('HSA')).toBe(5);
  });
});

describe('splitTaxableLot', () => {
  it('splits proportionally by basis fraction', () => {
    const acct = usdAccount({ type: 'TaxableBrokerage', balance: 100000, basis: 40000 });
    const { basisUsd, gainUsd } = splitTaxableLot(acct, 25000);
    expect(basisUsd).toBeCloseTo(10000, 6);
    expect(gainUsd).toBeCloseTo(15000, 6);
    expect(basisUsd + gainUsd).toBeCloseTo(25000, 6);
  });

  it('treats missing basis as zero (all gain)', () => {
    const acct = usdAccount({ type: 'TaxableBrokerage', balance: 100000 });
    const { basisUsd, gainUsd } = splitTaxableLot(acct, 25000);
    expect(basisUsd).toBe(0);
    expect(gainUsd).toBe(25000);
  });

  it('caps basis fraction at 1 when basis exceeds balance', () => {
    const acct = usdAccount({ type: 'TaxableBrokerage', balance: 10000, basis: 999999 });
    const { basisUsd, gainUsd } = splitTaxableLot(acct, 5000);
    expect(basisUsd).toBe(5000);
    expect(gainUsd).toBe(0);
  });

  it('returns zeros for a zero-balance account', () => {
    const acct = usdAccount({ type: 'TaxableBrokerage', balance: 0, basis: 0 });
    const { basisUsd, gainUsd } = splitTaxableLot(acct, 1000);
    expect(basisUsd).toBe(0);
    expect(gainUsd).toBe(1000);
  });
});

describe('solveRemittance', () => {
  it('returns spendingUnmet when there are no US sources (Thai-side funding is the caller job)', () => {
    const res = solveRemittance(300000, [], 35, true);
    expect(res.spendingUnmet).toBe(true);
    expect(res.shortfallThb).toBe(300000);
    expect(res.items).toHaveLength(0);
    expect(res.totalRemittedUsd).toBe(0);
    expect(res.totalRemittedThb).toBe(0);
  });

  it('orders US sources by minimum combined tax (Cash → Basis → Gain → Traditional)', () => {
    const sources: FundingSource[] = [
      { accountId: 'trad', sourceType: 'TraditionalIRA', availableUsd: 30000, isPre2024: false },
      { accountId: 'gain', sourceType: 'TaxableGain', availableUsd: 5000, isPre2024: false },
      { accountId: 'basis', sourceType: 'TaxableBasis', availableUsd: 5000, isPre2024: false },
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 10000, isPre2024: false },
    ];
    const res = solveRemittance(40000 * 35, sources, 35, true);
    expect(res.spendingUnmet).toBe(false);
    expect(res.items.map((i) => i.sourceType)).toEqual([
      'Cash',
      'TaxableBasis',
      'TaxableGain',
      'TraditionalIRA',
    ]);
    expect(res.items[0]?.amountUsd).toBeCloseTo(10000, 6);
    expect(res.items[1]?.amountUsd).toBeCloseTo(5000, 6);
    expect(res.items[2]?.amountUsd).toBeCloseTo(5000, 6);
    expect(res.items[3]?.amountUsd).toBeCloseTo(20000, 6);
    expect(res.totalRemittedUsd).toBeCloseTo(40000, 6);
    expect(res.totalRemittedThb).toBeCloseTo(40000 * 35, 3);
  });

  it('Systemic #4 regression: pre-2024 flag ignored for TraditionalIRA (retirement never grandfathered)', () => {
    const sources: FundingSource[] = [
      { accountId: 'trad', sourceType: 'TraditionalIRA', availableUsd: 50000, isPre2024: true },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item).toBeDefined();
    expect(item?.sourceType).toBe('TraditionalIRA');
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
    expect(item?.preTaxOrigin).toBe('post2024');
  });

  it('honors Cash pre-2024 grandfather: assessable portion is 0', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 20000, isPre2024: true },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.sourceType).toBe('Cash');
    expect(item?.assessablePortionThb).toBe(0);
    expect(item?.preTaxOrigin).toBe('pre2024');
  });

  it('Cash post-2024 is fully assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 20000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
    expect(item?.preTaxOrigin).toBe('post2024');
  });

  it('TaxableBasis is never assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'b', sourceType: 'TaxableBasis', availableUsd: 20000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    expect(res.items[0]?.assessablePortionThb).toBe(0);
  });

  it('TaxableGain is fully assessable', () => {
    const sources: FundingSource[] = [
      { accountId: 'g', sourceType: 'TaxableGain', availableUsd: 20000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
  });

  it('Roth is fully assessable at solver layer (regulatory adjustment lives in thai-tax.ts)', () => {
    const sources: FundingSource[] = [
      { accountId: 'roth', sourceType: 'Roth', availableUsd: 20000, isPre2024: false },
    ];
    const res = solveRemittance(10000 * 35, sources, 35, true);
    const item = res.items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
  });

  it('non-resident year still emits items (residency short-circuit lives in thai-tax.ts)', () => {
    const sources: FundingSource[] = [
      { accountId: 'cash', sourceType: 'Cash', availableUsd: 1000, isPre2024: false },
    ];
    const res = solveRemittance(1000, sources, 35, false);
    expect(res.items).toHaveLength(1);
    expect(res.spendingUnmet).toBe(false);
    const item = res.items[0];
    expect(item?.assessablePortionThb).toBeCloseTo(item?.amountThb ?? -1, 6);
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

describe('buildFundingSources', () => {
  it('splits TaxableBrokerage into TaxableBasis + TaxableGain', () => {
    const accounts: Account[] = [
      usdAccount({ id: 'tb', type: 'TaxableBrokerage', balance: 100000, basis: 40000 }),
    ];
    const sources = buildFundingSources(accounts);
    expect(sources).toHaveLength(2);
    const basis = sources.find((s) => s.sourceType === 'TaxableBasis');
    const gain = sources.find((s) => s.sourceType === 'TaxableGain');
    expect(basis?.availableUsd).toBe(40000);
    expect(gain?.availableUsd).toBe(60000);
    expect(basis?.isPre2024).toBe(false);
    expect(gain?.isPre2024).toBe(false);
  });

  it('splits Cash into pre-2024 + post-2024 when snapshot is set', () => {
    const accounts: Account[] = [
      usdAccount({ id: 'c', type: 'Cash', balance: 20000, pre2024Snapshot: 8000 }),
    ];
    const sources = buildFundingSources(accounts);
    expect(sources).toHaveLength(2);
    const pre = sources.find((s) => s.isPre2024);
    const post = sources.find((s) => !s.isPre2024);
    expect(pre?.sourceType).toBe('Cash');
    expect(pre?.availableUsd).toBe(8000);
    expect(post?.sourceType).toBe('Cash');
    expect(post?.availableUsd).toBe(12000);
  });

  it('emits a single Cash source when snapshot is absent', () => {
    const accounts: Account[] = [usdAccount({ id: 'c', type: 'Cash', balance: 20000 })];
    const sources = buildFundingSources(accounts);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.availableUsd).toBe(20000);
    expect(sources[0]?.isPre2024).toBe(false);
  });

  it('emits a single source for retirement accounts and HSA (never grandfathered)', () => {
    const accounts: Account[] = [
      usdAccount({ id: 't', type: 'TraditionalIRA', balance: 50000, pre2024Snapshot: 10000 }),
      usdAccount({ id: 'r', type: 'RothIRA', balance: 30000 }),
      usdAccount({ id: 'h', type: 'HSA', balance: 15000 }),
      usdAccount({ id: 't401', type: 'Traditional401k', balance: 40000 }),
      usdAccount({ id: 'r401', type: 'Roth401k', balance: 20000 }),
    ];
    const sources = buildFundingSources(accounts);
    expect(sources).toHaveLength(5);
    expect(sources.every((s) => s.isPre2024 === false)).toBe(true);
    expect(sources.filter((s) => s.sourceType === 'TraditionalIRA')).toHaveLength(2);
    expect(sources.filter((s) => s.sourceType === 'Roth')).toHaveLength(2);
    expect(sources.filter((s) => s.sourceType === 'HSA')).toHaveLength(1);
  });

  it('excludes THB-currency accounts (Thai-side is consumed by the caller)', () => {
    const accounts: Account[] = [
      usdAccount({ id: 'usdCash', type: 'Cash', balance: 10000 }),
      { id: 'thbCash', type: 'Cash', currency: 'THB', balance: 500000 },
    ];
    const sources = buildFundingSources(accounts);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.accountId).toBe('usdCash');
  });
});
