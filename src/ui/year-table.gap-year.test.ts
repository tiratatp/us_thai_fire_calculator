// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRow, renderYearTable } from './year-table.js';
import type { Account, YearOutcome } from '../types.js';

const mockOutcome: YearOutcome = {
  year: 2026,
  age: 40,
  isThaiResident: true,
  balancesByAccount: { a: 1000 },
  rmdAmount: 0,
  rothConversionAmount: 0,
  ltcgHarvestedAmount: 0,
  remittances: [],
  usOrdinaryIncome: 0,
  usLtcgIncome: 0,
  usTax: 0,
  thaiAssessable: 0,
  thaiTax: 0,
  ftcApplied: 0,
  usTaxAfterFtc: 0,
  spendingMet: true,
};

function setupDOM(): void {
  document.body.innerHTML = '';
  const tabIds = ['inputs', 'results', 'drawdown', 'gap-year', 'references'] as const;
  for (const t of tabIds) {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = t;
    btn.setAttribute('aria-selected', 'false');
    document.body.appendChild(btn);
  }
  for (const t of tabIds) {
    const panel = document.createElement('section');
    panel.id = `${t}-tab`;
    panel.className = 'tab-panel hidden';
    document.body.appendChild(panel);
  }
}

const usdAccounts: readonly Account[] = [
  { id: 'a', type: 'Cash', currency: 'USD', balance: 1000 },
];

describe('year-table gap-year hint cell', () => {
  it('suggests gap year when Thai tax exceeds $10K USD', () => {
    const outcome: YearOutcome = { ...mockOutcome, thaiTax: 500_000 };
    const row = buildRow(outcome, usdAccounts, 35);
    expect(row.cells[10]).toMatch(/gap year/i);
  });

  it('does not suggest gap year at exactly $10K USD threshold', () => {
    const outcome: YearOutcome = { ...mockOutcome, thaiTax: 350_000 };
    const row = buildRow(outcome, usdAccounts, 35);
    expect(row.cells[10]).toBe('');
  });

  it('shows gap-year hint at age 65 with high Thai tax', () => {
    const outcome: YearOutcome = { ...mockOutcome, age: 65, thaiTax: 500_000 };
    const row = buildRow(outcome, usdAccounts, 35);
    expect(row.cells[10]).toMatch(/gap year/i);
  });

  it('suppresses gap-year hint after age 65 (health / logistics)', () => {
    const outcome: YearOutcome = { ...mockOutcome, age: 66, thaiTax: 500_000 };
    const row = buildRow(outcome, usdAccounts, 35);
    expect(row.cells[10]).toBe('');
  });

  it('suppresses gap-year hint at deep old age even with high Thai tax', () => {
    const outcome: YearOutcome = { ...mockOutcome, age: 85, thaiTax: 2_000_000 };
    const row = buildRow(outcome, usdAccounts, 35);
    expect(row.cells[10]).toBe('');
  });
});

describe('year-table Gap year? header link', () => {
  beforeEach(setupDOM);

  it('links to #gap-year top-level tab (not methodology)', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    renderYearTable(container, { p50: [mockOutcome], fxRateUsdThb: 35, accounts: usdAccounts });
    const link = container.querySelector('a[href="#gap-year"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toMatch(/gap year/i);
  });

  it('clicking switches to gap-year tab and sets hash', () => {
    const gapYearPanel = document.querySelector('#gap-year-tab') as HTMLElement;
    const container = document.createElement('div');
    document.body.appendChild(container);
    renderYearTable(container, { p50: [mockOutcome], fxRateUsdThb: 35, accounts: usdAccounts });
    const link = container.querySelector('a[href="#gap-year"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(location.hash).toBe('#gap-year');
    expect(gapYearPanel.classList.contains('hidden')).toBe(false);
  });
});
