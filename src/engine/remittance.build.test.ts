/**
 * Remittance builder + helper tests (T8): sourceOrder, splitTaxableLot,
 * buildFundingSources. Split from remittance.test.ts to respect 250 LOC.
 */
import { describe, expect, it } from 'vitest';
import type { Account } from '../types.js';
import {
  buildFundingSources,
  sourceOrder,
  sourceOrderIndex,
  splitTaxableLot,
} from './remittance.js';

function usdAccount(overrides: Partial<Account> = {}): Account {
  return { id: 'default', type: 'Cash', currency: 'USD', balance: 100000, ...overrides };
}

describe('sourceOrder', () => {
  it('fixes preference Cash → Basis → Gain → Traditional → Roth → HSA', () => {
    expect(sourceOrder()).toEqual([
      'Cash', 'TaxableBasis', 'TaxableGain', 'TraditionalIRA', 'Roth', 'HSA',
    ]);
  });

  it('sourceOrderIndex returns strictly ascending indices', () => {
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

describe('buildFundingSources', () => {
  it('splits TaxableBrokerage into TaxableBasis + TaxableGain', () => {
    const sources = buildFundingSources([
      usdAccount({ id: 'tb', type: 'TaxableBrokerage', balance: 100000, basis: 40000 }),
    ]);
    expect(sources).toHaveLength(2);
    expect(sources.find((s) => s.sourceType === 'TaxableBasis')?.availableUsd).toBe(40000);
    expect(sources.find((s) => s.sourceType === 'TaxableGain')?.availableUsd).toBe(60000);
  });

  it('splits Cash into pre-2024 + post-2024 when snapshot is set', () => {
    const sources = buildFundingSources([
      usdAccount({ id: 'c', type: 'Cash', balance: 20000, pre2024Snapshot: 8000 }),
    ]);
    expect(sources).toHaveLength(2);
    expect(sources.find((s) => s.isPre2024)?.availableUsd).toBe(8000);
    expect(sources.find((s) => !s.isPre2024)?.availableUsd).toBe(12000);
  });

  it('emits a single Cash source when snapshot is absent', () => {
    const sources = buildFundingSources([
      usdAccount({ id: 'c', type: 'Cash', balance: 20000 }),
    ]);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.availableUsd).toBe(20000);
    expect(sources[0]?.isPre2024).toBe(false);
  });

  it('single source for retirement/HSA (never grandfathered)', () => {
    const sources = buildFundingSources([
      usdAccount({ id: 't', type: 'TraditionalIRA', balance: 50000, pre2024Snapshot: 10000 }),
      usdAccount({ id: 'r', type: 'RothIRA', balance: 30000 }),
      usdAccount({ id: 'h', type: 'HSA', balance: 15000 }),
      usdAccount({ id: 't401', type: 'Traditional401k', balance: 40000 }),
      usdAccount({ id: 'r401', type: 'Roth401k', balance: 20000 }),
    ]);
    expect(sources).toHaveLength(5);
    expect(sources.every((s) => s.isPre2024 === false)).toBe(true);
    expect(sources.filter((s) => s.sourceType === 'TraditionalIRA')).toHaveLength(2);
    expect(sources.filter((s) => s.sourceType === 'Roth')).toHaveLength(2);
  });

  it('excludes THB-currency accounts', () => {
    const sources = buildFundingSources([
      usdAccount({ id: 'usdCash', type: 'Cash', balance: 10000 }),
      { id: 'thbCash', type: 'Cash', currency: 'THB', balance: 500000 },
    ]);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.accountId).toBe('usdCash');
  });
});
