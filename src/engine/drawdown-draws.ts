/**
 * Drawdown helpers — mutable account clones + THB/USD draw functions +
 * remittance fund-orchestration + tax payment. Split from drawdown.ts
 * to respect 250 LOC.
 */

import type { Account, RemittanceItem } from '../types.js';
import { EARLY_WITHDRAWAL_PENALTY_RATE } from '../data/constants.js';
import { buildFundingSources } from './funding-sources.js';
import { solveRemittance } from './remittance.js';

export interface MutAcct {
  id: string;
  type: Account['type'];
  currency: Account['currency'];
  balance: number;
  basis?: number;
  pre2024Snapshot?: number;
}

export function cloneAccounts(src: readonly Account[]): MutAcct[] {
  return src.map((a) => ({ ...a }));
}

export function toReadonly(a: MutAcct): Account {
  return {
    id: a.id,
    type: a.type,
    currency: a.currency,
    balance: a.balance,
    ...(a.basis !== undefined ? { basis: a.basis } : {}),
    ...(a.pre2024Snapshot !== undefined ? { pre2024Snapshot: a.pre2024Snapshot } : {}),
  };
}

/** Draw up to wantThb from THB Cash then THB TaxableBrokerage. Returns THB drawn. */
export function drawFromThb(accts: MutAcct[], wantThb: number): number {
  let remaining = wantThb;
  for (const type of ['Cash', 'TaxableBrokerage'] as const) {
    for (const a of accts) {
      if (remaining <= 0) return wantThb - remaining;
      if (a.currency !== 'THB' || a.type !== type) continue;
      const take = Math.min(remaining, a.balance);
      a.balance -= take;
      remaining -= take;
    }
  }
  return wantThb - remaining;
}

export interface UsdDrawResult {
  readonly drawn: number;
  readonly ltcgIncome: number;
  readonly ordinaryIncome: number;
  readonly penalty: number;
}

/**
 * Draw up to wantUsd from USD accounts in preference order for USD spending:
 * Cash → TaxableBrokerage (basis first) → Roth → Traditional → HSA.
 * Roth funds USD spending tax-free — this is Roth's shining moment when
 * paired with no remittance to Thailand (Thai tax = 0).
 */
export function drawFromUsd(
  accts: MutAcct[],
  wantUsd: number,
  age: number,
): UsdDrawResult {
  let remaining = wantUsd;
  let ltcgIncome = 0;
  let ordinaryIncome = 0;
  let penalty = 0;
  const order: Array<Account['type']> = [
    'Cash',
    'TaxableBrokerage',
    'RothIRA',
    'Roth401k',
    'TraditionalIRA',
    'Traditional401k',
    'HSA',
  ];
  for (const t of order) {
    for (const a of accts) {
      if (remaining <= 0) {
        return { drawn: wantUsd - remaining, ltcgIncome, ordinaryIncome, penalty };
      }
      if (a.currency !== 'USD' || a.type !== t || a.balance <= 0) continue;
      const take = Math.min(remaining, a.balance);
      a.balance -= take;
      remaining -= take;
      if (a.type === 'TaxableBrokerage') {
        const basis = Math.min(a.basis ?? 0, take);
        const gain = take - basis;
        if (a.basis !== undefined) a.basis = Math.max(0, a.basis - basis);
        ltcgIncome += gain;
      } else if (a.type === 'TraditionalIRA' || a.type === 'Traditional401k') {
        ordinaryIncome += take;
        if (age < 59.5) penalty += take * EARLY_WITHDRAWAL_PENALTY_RATE.value;
      } else if (a.type === 'HSA') {
        ordinaryIncome += take;
        if (age < 65) penalty += take * 0.20;
      }
    }
  }
  return { drawn: wantUsd - remaining, ltcgIncome, ordinaryIncome, penalty };
}

export interface FundThbResult {
  readonly items: readonly RemittanceItem[];
  readonly ltcgIncome: number;
  readonly ordinaryIncome: number;
  readonly penalty: number;
  readonly poolUsedUsd: number;
  readonly remainingThb: number;
}

export function fundThb(
  accts: MutAcct[],
  thbNeed: number,
  pool: number,
  fxRate: number,
  age: number,
  isThaiResident: boolean,
): FundThbResult {
  const thaiDrawn = drawFromThb(accts, thbNeed);
  let remainingThb = thbNeed - thaiDrawn;
  if (remainingThb <= 1e-6) {
    return { items: [], ltcgIncome: 0, ordinaryIncome: 0, penalty: 0, poolUsedUsd: 0, remainingThb: 0 };
  }
  const poolUsd = Math.min(remainingThb / fxRate, pool);
  remainingThb -= poolUsd * fxRate;
  let items: readonly RemittanceItem[] = [];
  let ltcgIncome = 0;
  let ordinaryIncome = 0;
  let penalty = 0;
  if (remainingThb > 1e-6) {
    const sources = buildFundingSources(accts.map(toReadonly));
    const res = solveRemittance(remainingThb, sources, fxRate, isThaiResident);
    items = res.items;
    for (const it of res.items) {
      const target = accts.find((x) => x.id === it.sourceAccountId);
      if (target) {
        const take = Math.min(it.amountUsd, target.balance);
        target.balance -= take;
        if (target.type === 'TaxableBrokerage' && target.basis !== undefined) {
          const basisTake = Math.min(target.basis, take);
          target.basis = Math.max(0, target.basis - basisTake);
        }
      }
      if (it.sourceType === 'TaxableGain') ltcgIncome += it.amountUsd;
      if (it.sourceType === 'TraditionalIRA') {
        ordinaryIncome += it.amountUsd;
        if (age < 59.5) penalty += it.amountUsd * EARLY_WITHDRAWAL_PENALTY_RATE.value;
      } else if (it.sourceType === 'HSA') {
        ordinaryIncome += it.amountUsd;
        if (age < 65) penalty += it.amountUsd * 0.20;
      }
    }
    remainingThb -= res.totalRemittedThb;
  }
  return { items, ltcgIncome, ordinaryIncome, penalty, poolUsedUsd: poolUsd, remainingThb };
}

export function applyConversion(accts: MutAcct[], amount: number): void {
  let remain = amount;
  for (const a of accts) {
    if (remain <= 0) break;
    if (a.currency !== 'USD') continue;
    if (a.type !== 'TraditionalIRA' && a.type !== 'Traditional401k') continue;
    const take = Math.min(remain, a.balance);
    a.balance -= take;
    remain -= take;
  }
  const roth = accts.find((a) => a.currency === 'USD' && a.type === 'RothIRA');
  if (roth) roth.balance += amount;
  else accts.push({ id: 'roth-conv', type: 'RothIRA', currency: 'USD', balance: amount });
}

export function payUsTax(
  accts: MutAcct[],
  owed: number,
  pool: number,
): { pool: number; unmet: boolean } {
  let remaining = owed;
  const poolTake = Math.min(remaining, pool);
  const newPool = pool - poolTake;
  remaining -= poolTake;
  if (remaining <= 1e-6) return { pool: newPool, unmet: false };
  for (const a of accts) {
    if (remaining <= 1e-6) break;
    if (a.currency !== 'USD' || a.type !== 'Cash') continue;
    const take = Math.min(remaining, a.balance);
    a.balance -= take;
    remaining -= take;
  }
  return { pool: newPool, unmet: remaining > 1e-6 };
}

export function payThaiTax(accts: MutAcct[], owedThb: number): boolean {
  let remaining = owedThb;
  for (const a of accts) {
    if (remaining <= 1e-6) break;
    if (a.currency !== 'THB' || a.type !== 'Cash') continue;
    const take = Math.min(remaining, a.balance);
    a.balance -= take;
    remaining -= take;
  }
  return remaining > 1e-6;
}
