// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { columnAnchorMap, buildRow, renderYearTable } from './year-table.js';
import { methodologyAnchorSet } from '../methodology/render.js';
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
  const inputsBtn = document.createElement('button');
  inputsBtn.className = 'tab';
  inputsBtn.dataset.tab = 'inputs';
  inputsBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(inputsBtn);

  const resultsBtn = document.createElement('button');
  resultsBtn.className = 'tab';
  resultsBtn.dataset.tab = 'results';
  resultsBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(resultsBtn);

  const methBtn = document.createElement('button');
  methBtn.className = 'tab';
  methBtn.dataset.tab = 'methodology';
  methBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(methBtn);

  const inputsPanel = document.createElement('section');
  inputsPanel.id = 'inputs-tab';
  inputsPanel.className = 'tab-panel hidden';
  document.body.appendChild(inputsPanel);

  const resultsPanel = document.createElement('section');
  resultsPanel.id = 'results-tab';
  resultsPanel.className = 'tab-panel hidden';
  document.body.appendChild(resultsPanel);

  const methPanel = document.createElement('section');
  methPanel.id = 'methodology-tab';
  methPanel.className = 'tab-panel hidden';
  document.body.appendChild(methPanel);
}

describe('year-table', () => {
  it('every column header maps to a valid methodology anchor', () => {
    const map = columnAnchorMap();
    const anchors = methodologyAnchorSet();
    for (const [col, anchor] of map.entries()) {
      expect(anchors.has(anchor), `anchor ${anchor} for column ${col}`).toBe(true);
    }
  });

  it('buildRow returns correct shape and splits portfolio by currency', () => {
    const outcome: YearOutcome = {
      year: 2026,
      age: 40,
      isThaiResident: true,
      balancesByAccount: { a: 100, b: 200 },
      rmdAmount: 10,
      rothConversionAmount: 20,
      ltcgHarvestedAmount: 30,
      remittances: [
        { sourceAccountId: 'a', amountUsd: 40, amountThb: 1400, assessablePortionThb: 1400, sourceType: 'Cash', preTaxOrigin: 'post2024' }
      ],
      usOrdinaryIncome: 0,
      usLtcgIncome: 0,
      usTax: 50,
      thaiAssessable: 1400,
      thaiTax: 60,
      ftcApplied: 70,
      usTaxAfterFtc: 0,
      spendingMet: true,
    };

    const accounts: Account[] = [
      { id: 'a', type: 'Cash', currency: 'THB', balance: 100 },
      { id: 'b', type: 'Cash', currency: 'USD', balance: 200 },
    ];

    const row = buildRow(outcome, accounts);
    expect(row.cells.length).toBe(11);
    expect(row.cells[0]).toBe('Year 2026 (Age 40)');
    expect(row.cells[1]).toMatch(/100/); // THB 100
    expect(row.cells[2]).toBe('$200');
    expect(row.cells[3]).toBe('$10');
    expect(row.cells[4]).toBe('$20');
    expect(row.cells[5]).toBe('$30');
    expect(row.cells[6]).toBe('$40');
    expect(row.cells[7]).toBe('$50');
    expect(row.cells[8]).toMatch(/60/); // THB 60
    expect(row.cells[9]).toBe('$70');
    expect(row.cells[10]).toBe('Yes');
  });

  it('renders table in DOM', () => {
    const container = document.createElement('div');
    const p50: YearOutcome[] = Array.from({ length: 30 }, (_, i) => ({
      year: 2026 + i,
      age: 40 + i,
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
    }));

    const accounts: Account[] = [{ id: 'a', type: 'Cash', currency: 'USD', balance: 1000 }];
    renderYearTable(container, { p50, fxRateUsdThb: 35, accounts });
    
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(30);
  });
});

describe('year-table methodology links', () => {
  beforeEach(setupDOM);

  it('every mapped column header href matches #methodology/<id>', () => {
    const container = document.createElement('div');
    container.id = 'year-table-container';
    document.body.appendChild(container);

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    const section = document.createElement('div');
    section.id = 'us-brackets-2026';
    methPanel.appendChild(section);

    const accounts: Account[] = [{ id: 'a', type: 'Cash', currency: 'USD', balance: 1000 }];
    renderYearTable(container, { p50: [mockOutcome], fxRateUsdThb: 35, accounts });

    const map = columnAnchorMap();
    for (const [, anchor] of map.entries()) {
      const link = container.querySelector(`a[href="#methodology/${anchor}"]`);
      expect(link).not.toBeNull();
    }
  });

  it('no header href contains methodology.html', () => {
    const container = document.createElement('div');
    container.id = 'year-table-container';
    document.body.appendChild(container);

    const accounts: Account[] = [{ id: 'a', type: 'Cash', currency: 'USD', balance: 1000 }];
    renderYearTable(container, { p50: [mockOutcome], fxRateUsdThb: 35, accounts });

    const links = container.querySelectorAll('a[href*="methodology.html"]');
    expect(links.length).toBe(0);
  });

  it('clicking a header switches tab and sets location.hash', () => {
    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    const section = document.createElement('div');
    section.id = 'us-brackets-2026';
    methPanel.appendChild(section);

    const container = document.createElement('div');
    container.id = 'year-table-container';
    document.body.appendChild(container);

    const accounts: Account[] = [{ id: 'a', type: 'Cash', currency: 'USD', balance: 1000 }];
    renderYearTable(container, { p50: [mockOutcome], fxRateUsdThb: 35, accounts });

    const link = container.querySelector('a[href="#methodology/us-brackets-2026"]');
    expect(link).not.toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link!.dispatchEvent(clickEvent);

    expect(location.hash).toBe('#methodology/us-brackets-2026');
    expect(methPanel.classList.contains('hidden')).toBe(false);
  });
});


