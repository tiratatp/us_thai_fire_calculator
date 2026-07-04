/**
 * Funding source builder — flattens USD accounts into remittance sources.
 *
 * Split out from remittance.ts to respect the 250-LOC file ceiling.
 *
 * @see .research/08-algorithm-v2.md Step 2/3
 */

import type { Account } from '../types.js';
import type { FundingSource } from './remittance.js';

/**
 * Flatten USD accounts into a list of `FundingSource` records.
 *
 * - `TaxableBrokerage` → 2 sources (`TaxableBasis` + `TaxableGain`).
 * - `Cash` with `pre2024Snapshot` → 2 sources (pre + post 2024).
 * - `Cash` without snapshot → 1 source (post-2024).
 * - Retirement accounts + HSA → 1 source, `isPre2024=false` always
 *   (retirement is never grandfathered — Systemic #4).
 * - THB-currency accounts are excluded (consumed Thai-side by the caller).
 */
export function buildFundingSources(accounts: readonly Account[]): FundingSource[] {
  const out: FundingSource[] = [];
  for (const acc of accounts) {
    if (acc.currency !== 'USD') continue;
    if (acc.balance <= 0) continue;
    switch (acc.type) {
      case 'Cash': {
        const snap = acc.pre2024Snapshot ?? 0;
        const preAmt = Math.min(Math.max(0, snap), acc.balance);
        const postAmt = acc.balance - preAmt;
        if (preAmt > 0) {
          out.push({
            accountId: acc.id,
            sourceType: 'Cash',
            availableUsd: preAmt,
            isPre2024: true,
          });
        }
        if (postAmt > 0 || preAmt === 0) {
          out.push({
            accountId: acc.id,
            sourceType: 'Cash',
            availableUsd: postAmt,
            isPre2024: false,
          });
        }
        break;
      }
      case 'TaxableBrokerage': {
        const basis = Math.min(Math.max(0, acc.basis ?? 0), acc.balance);
        const gain = Math.max(0, acc.balance - basis);
        out.push({
          accountId: acc.id,
          sourceType: 'TaxableBasis',
          availableUsd: basis,
          isPre2024: false,
        });
        out.push({
          accountId: acc.id,
          sourceType: 'TaxableGain',
          availableUsd: gain,
          isPre2024: false,
        });
        break;
      }
      case 'TraditionalIRA':
      case 'Traditional401k':
        out.push({
          accountId: acc.id,
          sourceType: 'TraditionalIRA',
          availableUsd: acc.balance,
          isPre2024: false,
        });
        break;
      case 'RothIRA':
      case 'Roth401k':
        out.push({
          accountId: acc.id,
          sourceType: 'Roth',
          availableUsd: acc.balance,
          isPre2024: false,
        });
        break;
      case 'HSA':
        out.push({
          accountId: acc.id,
          sourceType: 'HSA',
          availableUsd: acc.balance,
          isPre2024: false,
        });
        break;
      default: {
        const unreachable: never = acc.type;
        throw new Error(`Unhandled AccountType: ${String(unreachable)}`);
      }
    }
  }
  return out;
}
