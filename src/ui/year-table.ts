import type { Account, YearOutcome } from '../types.js';
import { formatUsd, formatThb } from './format.js';
import { deepLinkToMethodology, switchTab } from './navigate.js';

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

// Threshold above which a "consider a gap year abroad" hint is shown for a
// row. Set below the Thai top-bracket break-even so the hint fires even in
// pre-RMD years when a Roth conversion + 0%-LTCG harvest opportunity is on
// the table (which the calculator otherwise suppresses via Systemic #2/#3).
export const GAP_YEAR_HINT_THRESHOLD_USD = 10_000;

// Age above which the gap-year hint is suppressed. Rearranging an entire
// year abroad becomes progressively harder to physically execute past mid
// 60s (health, insurance, RMD forcing distribution anyway from age 73/75),
// and the Roth / LTCG upside also fades once RMD consumes the 12% bracket
// space. Users past this age should treat any residual Thai tax as
// unavoidable rather than a gap-year candidate.
export const GAP_YEAR_HINT_MAX_AGE = 65;

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

function gapYearHintCell(thaiTaxThb: number, fxRateUsdThb: number, age: number): string {
  if (age > GAP_YEAR_HINT_MAX_AGE) return '';
  if (!Number.isFinite(fxRateUsdThb) || fxRateUsdThb <= 0) return '';
  const thaiTaxUsd = thaiTaxThb / fxRateUsdThb;
  if (thaiTaxUsd <= GAP_YEAR_HINT_THRESHOLD_USD) return '';
  return 'Consider gap year abroad';
}

export function buildRow(
  outcome: YearOutcome,
  accounts: readonly Account[],
  fxRateUsdThb: number,
): { readonly cells: readonly string[] } {
  let thbTotal = 0;
  let usdTotal = 0;
  for (const [accountId, balance] of Object.entries(outcome.balancesByAccount)) {
    const account = accounts.find(a => a.id === accountId);
    // Currency lookup with defensive fallback. The primary source is the
    // Account.currency field. Fallbacks (in priority order) cover two real
    // failure modes we've seen: (1) stale localStorage from before the
    // multi-currency refactor where saved accounts have no currency field;
    // (2) synthetic accounts the engine adds during drawdown (e.g.
    // 'usd-cash-pool') that were never in the user's accounts array. The id
    // prefix is the calculator's naming contract: 'thb-*' means THB, every
    // other id (including 'usd-cash-pool') means USD.
    const isThb = account?.currency
      ? account.currency === 'THB'
      : accountId.startsWith('thb-');
    if (isThb) thbTotal += balance;
    else usdTotal += balance;
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
      gapYearHintCell(outcome.thaiTax, fxRateUsdThb, outcome.age),
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
    'Gap year?',
  ];

  const thead = headers.map(h => {
    if (h === 'Gap year?') {
      return `<th><a href="#gap-year" data-tab-target="gap-year">${esc(h)}</a></th>`;
    }
    const anchor = map.get(h);
    if (anchor) {
      return `<th><a href="#references/${esc(anchor)}" data-methodology-anchor="${esc(anchor)}">${esc(h)}</a></th>`;
    }
    return `<th>${esc(h)}</th>`;
  }).join('');

  const tbody = inputs.p50.map(outcome => {
    const row = buildRow(outcome, inputs.accounts, inputs.fxRateUsdThb);
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
    if (!(e.target instanceof HTMLElement)) return;
    const tabLink = e.target.closest<HTMLElement>('a[data-tab-target]');
    if (tabLink) {
      e.preventDefault();
      const target = tabLink.dataset.tabTarget;
      if (target !== 'gap-year') return;
      history.pushState(null, '', '#gap-year');
      switchTab('gap-year');
      return;
    }
    const t = e.target.closest<HTMLElement>('a[data-methodology-anchor]');
    if (!t) return;
    e.preventDefault();
    const id = t.dataset.methodologyAnchor;
    if (!id) return;
    history.pushState(null, '', `#references/${id}`);
    deepLinkToMethodology(id);
  });
}
