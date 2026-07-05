import type { Account, YearOutcome } from '../types.js';
import { methodologyAnchorSet } from '../methodology/render.js';
import { formatUsd, formatThb } from './format.js';
import { deepLinkToMethodology } from './navigate.js';

export interface YearTableInputs {
  readonly p50: readonly YearOutcome[];
  readonly fxRateUsdThb: number;
  readonly accounts: readonly Account[];
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
    ['Thai portfolio (THB)', 'monte-carlo-defaults'],
    ['US portfolio (USD)', 'monte-carlo-defaults'],
    ['RMD', 'us-rmd-table'],
    ['LTCG harvested', 'us-ltcg-2026'],
    ['Remittance amount USD', 'ftc-corrected'],
    ['US tax', 'us-brackets-2026'],
    ['Thai tax', 'thai-pit-brackets'],
    ['FTC applied', 'ftc-corrected'],
  ]);
}

export function buildRow(
  outcome: YearOutcome,
  accounts: readonly Account[],
): { readonly cells: readonly string[] } {
  let thbTotal = 0;
  let usdTotal = 0;
  for (const [accountId, balance] of Object.entries(outcome.balancesByAccount)) {
    const account = accounts.find(a => a.id === accountId);
    if (account?.currency === 'THB') {
      thbTotal += balance;
    } else {
      usdTotal += balance;
    }
  }

  let remittanceUsd = 0;
  for (const rem of outcome.remittances) {
    remittanceUsd += rem.amountUsd;
  }

  return {
    cells: [
      `Year ${outcome.year} (Age ${outcome.age})`,
      formatThb(thbTotal),
      formatUsd(usdTotal),
      formatUsd(outcome.rmdAmount),
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
    'Thai portfolio (THB)',
    'US portfolio (USD)',
    'RMD',
    'LTCG harvested',
    'Remittance amount USD',
    'US tax',
    'Thai tax',
    'FTC applied',
    'Spending met',
  ];

  const thead = headers.map(h => {
    const anchor = map.get(h);
    if (anchor) {
      return `<th><a href="#references/${esc(anchor)}" data-methodology-anchor="${esc(anchor)}">${esc(h)}</a></th>`;
    }
    return `<th>${esc(h)}</th>`;
  }).join('');

  const tbody = inputs.p50.map(outcome => {
    const row = buildRow(outcome, inputs.accounts);
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

  container.addEventListener('click', (e) => {
    const t = e.target instanceof HTMLElement
      ? e.target.closest<HTMLElement>('a[data-methodology-anchor]')
      : null;
    if (!t) return;
    e.preventDefault();
    const id = t.dataset.methodologyAnchor;
    if (!id) return;
    history.pushState(null, '', `#references/${id}`);
    deepLinkToMethodology(id);
  });
}
