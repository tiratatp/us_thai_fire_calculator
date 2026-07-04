/**
 * FTC engine tests (T7) — HIGHEST-RISK. TDD: written BEFORE the impl.
 * Anchor: plan §T7 QA + Oracle "Systemic #1" (never double-credit).
 */
import { describe, expect, it } from 'vitest';
import type { RegulatoryScenario, RemittanceItem, RemittanceSourceType } from '../types.js';
import { computeFtc, primaryTaxerFor, type PerItemTax } from './ftc.js';

const OPTIMISTIC: RegulatoryScenario = {
  rothTaxedByThailand: true,
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

function makeItem(sourceType: RemittanceSourceType, amountUsd: number): RemittanceItem {
  return {
    sourceAccountId: 'acc-1',
    amountUsd,
    amountThb: amountUsd * 35,
    assessablePortionThb: amountUsd * 35,
    sourceType,
    preTaxOrigin: 'post2024',
  };
}

describe('primaryTaxerFor', () => {
  it('routes TraditionalIRA to Thailand (Art. 20(1))', () => {
    expect(primaryTaxerFor('TraditionalIRA')).toBe('Thailand');
  });
  it('routes Roth to Thailand (Art. 20(1))', () => {
    expect(primaryTaxerFor('Roth')).toBe('Thailand');
  });
  it('routes HSA to Thailand (pension-like)', () => {
    expect(primaryTaxerFor('HSA')).toBe('Thailand');
  });
  it('routes TaxableGain to Thailand (Art. 13)', () => {
    expect(primaryTaxerFor('TaxableGain')).toBe('Thailand');
  });
  it('routes Cash to US (already-taxed principal)', () => {
    expect(primaryTaxerFor('Cash')).toBe('US');
  });
  it('routes TaxableBasis to US (already-taxed principal)', () => {
    expect(primaryTaxerFor('TaxableBasis')).toBe('US');
  });
});

describe('computeFtc — D3 anchor scenarios', () => {
  it('D3 optimistic: re-sourcing on → US FTC = min(3850, 7500), total = 7500', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TraditionalIRA', 50_000),
        primary: 'Thailand',
        usTaxOnItem: 3850,
        thaiTaxOnItem: 7500,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    expect(result.ftcApplied).toBe(3850);
    expect(result.usTaxAfterFtc).toBe(0);
    expect(result.thaiTaxAfterFtc).toBe(7500);
    expect(result.totalTax).toBe(7500);
  });

  it('D3 pessimistic: re-sourcing off → no FTC, total = 11350', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TraditionalIRA', 50_000),
        primary: 'Thailand',
        usTaxOnItem: 3850,
        thaiTaxOnItem: 7500,
      },
    ];

    const result = computeFtc(perItem, PESSIMISTIC);

    expect(result.ftcApplied).toBe(0);
    expect(result.usTaxAfterFtc).toBe(3850);
    expect(result.thaiTaxAfterFtc).toBe(7500);
    expect(result.totalTax).toBe(11_350);
  });

  it('Systemic #1 regression: total never below higher-of-the-two even with optimistic re-sourcing', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TraditionalIRA', 50_000),
        primary: 'Thailand',
        usTaxOnItem: 3850,
        thaiTaxOnItem: 7500,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    // Thai side keeps its full $7,500 — no reverse credit against US.
    expect(result.thaiTaxAfterFtc).toBe(7500);
    expect(result.totalTax).toBeGreaterThanOrEqual(7500);
  });
});

describe('computeFtc — Roth remittance, US = 0', () => {
  it('no US tax → no FTC applied, Thai stands', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('Roth', 30_000),
        primary: 'Thailand',
        usTaxOnItem: 0,
        thaiTaxOnItem: 4000,
      },
    ];

    const opt = computeFtc(perItem, OPTIMISTIC);
    expect(opt.ftcApplied).toBe(0);
    expect(opt.usTaxAfterFtc).toBe(0);
    expect(opt.thaiTaxAfterFtc).toBe(4000);
    expect(opt.totalTax).toBe(4000);

    const pes = computeFtc(perItem, PESSIMISTIC);
    expect(pes.ftcApplied).toBe(0);
    expect(pes.totalTax).toBe(4000);
  });
});

describe('computeFtc — LTCG with re-sourcing on', () => {
  it('US 3000, Thai 2500 → FTC 2500, US net 500, total 3000', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TaxableGain', 20_000),
        primary: 'Thailand',
        usTaxOnItem: 3000,
        thaiTaxOnItem: 2500,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    expect(result.ftcApplied).toBe(2500);
    expect(result.usTaxAfterFtc).toBe(500);
    expect(result.thaiTaxAfterFtc).toBe(2500);
    expect(result.totalTax).toBe(3000);
  });
});

describe('computeFtc — Cash/TaxableBasis US-primary', () => {
  it('already-taxed principal, no Thai tax → total 0, no FTC', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('Cash', 10_000),
        primary: 'US',
        usTaxOnItem: 0,
        thaiTaxOnItem: 0,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    expect(result.ftcApplied).toBe(0);
    expect(result.usTaxAfterFtc).toBe(0);
    expect(result.thaiTaxAfterFtc).toBe(0);
    expect(result.totalTax).toBe(0);
  });

  it('never credits US-primary item toward Thai side (Systemic #1)', () => {
    // Contrived: even if Thai side somehow assessed tax on a US-primary
    // item, computeFtc must NOT let the US tax cancel that out.
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TaxableBasis', 5000),
        primary: 'US',
        usTaxOnItem: 100,
        thaiTaxOnItem: 50,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    // Both sides stand — no cross-crediting on US-primary items in v1.
    expect(result.ftcApplied).toBe(0);
    expect(result.usTaxAfterFtc).toBe(100);
    expect(result.thaiTaxAfterFtc).toBe(50);
    expect(result.totalTax).toBe(150);
  });
});

describe('computeFtc — mixed items', () => {
  it('Traditional (Thai-primary, re-sourced) + Cash (US-primary, zeros) sum correctly', () => {
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TraditionalIRA', 50_000),
        primary: 'Thailand',
        usTaxOnItem: 3850,
        thaiTaxOnItem: 7500,
      },
      {
        item: makeItem('Cash', 10_000),
        primary: 'US',
        usTaxOnItem: 0,
        thaiTaxOnItem: 0,
      },
    ];

    const result = computeFtc(perItem, OPTIMISTIC);

    expect(result.ftcApplied).toBe(3850);
    expect(result.usTaxAfterFtc).toBe(0);
    expect(result.thaiTaxAfterFtc).toBe(7500);
    expect(result.totalTax).toBe(7500);
  });
});

describe('computeFtc — NIIT placeholder', () => {
  it('v1 treats the whole US tax on the item as creditable when re-sourcing is on; niitCreditableAgainstThai is reserved for a future refinement', () => {
    // Same inputs, toggle only niitCreditableAgainstThai — result unchanged in v1.
    const perItem: PerItemTax[] = [
      {
        item: makeItem('TraditionalIRA', 50_000),
        primary: 'Thailand',
        usTaxOnItem: 3850,
        thaiTaxOnItem: 7500,
      },
    ];

    const niitOn = computeFtc(perItem, { ...OPTIMISTIC, niitCreditableAgainstThai: true });
    const niitOff = computeFtc(perItem, { ...OPTIMISTIC, niitCreditableAgainstThai: false });

    expect(niitOn).toEqual(niitOff);
  });
});

describe('computeFtc — empty', () => {
  it('empty items → all zeros', () => {
    const result = computeFtc([], OPTIMISTIC);
    expect(result.ftcApplied).toBe(0);
    expect(result.usTaxAfterFtc).toBe(0);
    expect(result.thaiTaxAfterFtc).toBe(0);
    expect(result.totalTax).toBe(0);
  });
});
