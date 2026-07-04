import type { YearOutcome } from '../types.js';
import { methodologyAnchorSet } from '../methodology/render.js';
import { formatUsd, formatThb } from './format.js';

export interface YearTableInputs {
  readonly p50: readonly YearOutcome[];
  readonly fxRateUsdThb: number;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function columnAnchorMap(): ReadonlyMap<string, string> {
  return new Map([
    ['Portfolio total', 'monte-carlo-defaults'],
    ['RMD', 'us-rmd-table'],
    ['Roth conversion', 'roth-conversion-value-test'],
    ['LTCG harvested', 'us-ltcg-2026'],
    ['Remittance amount USD', 'ftc-corrected'],
    ['US tax', 'us-brackets-2026'],
    ['Thai tax', 'thai-pit-brackets'],
    ['FTC applied', 'ftc-corrected'],
  ]);
}

export function buildRow(outcome: YearOutcome): { readonly cells: readonly string[] } {
  let portfolioTotal = 0;
  for (const bal of Object.values(outcome.balancesByAccount)) {
    portfolioTotal += bal;
  }

  let remittanceUsd = 0;
  for (const rem of outcome.remittances) {
    remittanceUsd += rem.amountUsd;
  }

  return {
    cells: [
      `Year ${outcome.year} (Age ${outcome.age})`,
      formatUsd(portfolioTotal),
      formatUsd(outcome.rmdAmount),
      formatUsd(outcome.rothConversionAmount),
      formatUsd(outcome.ltcgHarvestedAmount),
      formatUsd(remittanceUsd),
      formatUsd(outcome.usTax),
      formatThb(outcome.thaiTax),
      formatUsd(outcome.ftcApplied),
      outcome.spendingMet ? 'Yes' : 'No',
    ],
  };
}

export function renderYearTable(container: HTMLElement, inputs: YearTableInputs): void {
  const map = columnAnchorMap();
  
  const headers = [
    'Year / Age',
    'Portfolio total',
    'RMD',
    'Roth conversion',
    'LTCG harvested',
    'Remittance amount USD',
    'US tax',
    'Thai tax',
    'FTC applied',
    'Spending met'
  ];

  const thead = headers.map(h => {
    const anchor = map.get(h);
    if (anchor) {
      return `<th><a href="methodology.html#${esc(anchor)}">${esc(h)}</a></th>`;
    }
    return `<th>${esc(h)}</th>`;
  }).join('');

  const tbody = inputs.p50.map(outcome => {
    const row = buildRow(outcome);
    return `<tr>${row.cells.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`;
  }).join('');

  container.innerHTML = `
    <table class="year-table">
      <thead>
        <tr>${thead}</tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>
  `;
}
