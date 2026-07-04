/**
 * Drawdown year_step orchestrator (T10).
 *
 * Implements .research/08-algorithm-v2.md Steps 0-11. Corrects Oracle
 * Systemic #1 (single-primary-taxer FTC), #2 (value-test Roth), #3 (0%
 * LTCG vs Roth conversion mutex — delegated to valueTestRothConversion),
 * #4 (no grandfathering for retirement accounts).
 *
 * Draw + tax-payment helpers → drawdown-draws.ts.
 * Tax computation helpers → drawdown-tax.ts.
 */

import type {
  Account,
  Assumption,
  RegulatoryScenario,
  YearOutcome,
} from '../types.js';
import {
  allocateAndComputeFtc,
  computeThaiTax,
  computeUsTax,
  returnForAccountType,
} from './drawdown-tax.js';
import {
  applyConversion,
  cloneAccounts,
  drawFromUsd,
  fundThb,
  payThaiTax,
  payUsTax,
  toReadonly,
  type MutAcct,
} from './drawdown-draws.js';
import { stepFx } from './fx.js';
import { rmdAmount } from './rmd.js';
import { valueTestRothConversion } from './roth-conversion.js';

export interface YearShocks {
  readonly stockReturn: number;
  readonly bondReturn: number;
  readonly intlReturn: number;
  readonly cashReturn: number;
  readonly usInflation: number;
  readonly thaiInflation: number;
  readonly fxLogShockZ: number;
}

export interface YearState {
  readonly year: number;
  readonly age: number;
  readonly birthYear: number;
  readonly accounts: readonly Account[];
  readonly fxRateUsdThb: number;
  readonly cumulativeUsTaxPaid: number;
  readonly cumulativeThaiTaxPaid: number;
  readonly failed: boolean;
  readonly failureYear?: number;
}

export interface YearStepInputs {
  readonly state: YearState;
  readonly shocks: YearShocks;
  readonly baseExpensesThbMo: number;
  readonly baseExpensesThbYr: number;
  readonly baseTravelUsdYr: number;
  readonly isThaiResident: boolean;
  readonly regScenario: RegulatoryScenario;
  readonly assumption: Assumption;
}

function applyRmd(
  accts: MutAcct[],
  age: number,
  birthYear: number,
): { rmdTotal: number; ordinary: number } {
  let rmdTotal = 0;
  let ordinary = 0;
  for (const a of accts) {
    if (a.currency !== 'USD') continue;
    if (a.type !== 'TraditionalIRA' && a.type !== 'Traditional401k') continue;
    const amount = rmdAmount(a.balance, age, a.type, birthYear);
    const take = Math.min(amount, a.balance);
    a.balance -= take;
    rmdTotal += take;
    ordinary += take;
  }
  return { rmdTotal, ordinary };
}

export function yearStep(inputs: YearStepInputs): { state: YearState; outcome: YearOutcome } {
  const { state, shocks, isThaiResident, regScenario, assumption } = inputs;
  const accts = cloneAccounts(state.accounts);

  const thbNeed =
    (inputs.baseExpensesThbMo * 12 + inputs.baseExpensesThbYr) *
    Math.pow(1 + shocks.thaiInflation, state.year);
  const usdTravelNeed =
    inputs.baseTravelUsdYr * Math.pow(1 + shocks.usInflation, state.year);

  const s1 = applyRmd(accts, state.age, state.birthYear);
  let usOrdinaryIncome = s1.ordinary;
  let usdCashPool = s1.rmdTotal;

  const s2 = fundThb(accts, thbNeed, usdCashPool, state.fxRateUsdThb, state.age, isThaiResident);
  usdCashPool -= s2.poolUsedUsd;
  usOrdinaryIncome += s2.ordinaryIncome;
  let ltcgIncome = s2.ltcgIncome;
  let earlyPenalty = s2.penalty;

  let usdTravelRemaining = usdTravelNeed;
  const poolTake = Math.min(usdTravelRemaining, usdCashPool);
  usdCashPool -= poolTake;
  usdTravelRemaining -= poolTake;
  if (usdTravelRemaining > 1e-6) {
    const draw = drawFromUsd(accts, usdTravelRemaining, state.age);
    ltcgIncome += draw.ltcgIncome;
    usOrdinaryIncome += draw.ordinaryIncome;
    earlyPenalty += draw.penalty;
    usdTravelRemaining -= draw.drawn;
  }

  const traditionalUsBalance = accts
    .filter(
      (a) => a.currency === 'USD' && (a.type === 'TraditionalIRA' || a.type === 'Traditional401k'),
    )
    .reduce((s, a) => s + a.balance, 0);
  const conversionAmount = valueTestRothConversion({
    age: state.age,
    birthYear: state.birthYear,
    traditionalUsBalanceUsd: traditionalUsBalance,
    usOrdinaryIncomeUsd: usOrdinaryIncome,
    ltcgHarvestPlannedUsd: ltcgIncome,
    isThaiResident,
    regScenario,
  });
  if (conversionAmount > 0) {
    applyConversion(accts, conversionAmount);
    usOrdinaryIncome += conversionAmount;
  }

  const us = computeUsTax({ usOrdinaryIncome, usLtcgIncome: ltcgIncome, earlyPenalty });
  const thaiTaxThb = computeThaiTax({ items: s2.items, regScenario, isThaiResident });
  const thaiTaxUsd = thaiTaxThb / state.fxRateUsdThb;
  const ftc = allocateAndComputeFtc({
    items: s2.items,
    usTaxGross: us.usTaxGross,
    thaiTaxUsd,
    regScenario,
    totalUsOrdinaryIncome: usOrdinaryIncome,
    totalUsLtcgIncome: ltcgIncome,
  });

  let spendingUnmet = s2.remainingThb > 1e-6 || usdTravelRemaining > 1e-6;
  const usResult = payUsTax(accts, ftc.usTaxAfterFtc, usdCashPool);
  usdCashPool = usResult.pool;
  if (usResult.unmet) spendingUnmet = true;
  if (payThaiTax(accts, thaiTaxThb)) spendingUnmet = true;

  if (usdCashPool > 1e-6) {
    const existing = accts.find((a) => a.id === 'usd-cash-pool');
    if (existing) existing.balance += usdCashPool;
    else accts.push({ id: 'usd-cash-pool', type: 'Cash', currency: 'USD', balance: usdCashPool });
  }

  for (const a of accts) a.balance *= 1 + returnForAccountType(a.type, shocks, assumption);
  const newFxRate = stepFx(state.fxRateUsdThb, shocks.fxLogShockZ, assumption.fxUsdThb, 1);

  const balancesByAccount: Record<string, number> = {};
  for (const a of accts) balancesByAccount[a.id] = a.balance;
  const thaiAssessable = s2.items.reduce((s, it) => s + it.assessablePortionThb, 0);
  const outcome: YearOutcome = {
    year: state.year,
    age: state.age,
    isThaiResident,
    balancesByAccount,
    rmdAmount: s1.rmdTotal,
    rothConversionAmount: conversionAmount,
    ltcgHarvestedAmount: ltcgIncome,
    remittances: s2.items,
    usOrdinaryIncome,
    usLtcgIncome: ltcgIncome,
    usTax: us.usTaxGross,
    thaiAssessable,
    thaiTax: thaiTaxThb,
    ftcApplied: ftc.ftcApplied,
    usTaxAfterFtc: ftc.usTaxAfterFtc,
    spendingMet: !spendingUnmet,
  };

  const failed = state.failed || spendingUnmet || accts.some((a) => a.balance < -1e-6);
  const newState: YearState = {
    year: state.year + 1,
    age: state.age + 1,
    birthYear: state.birthYear,
    accounts: accts.map(toReadonly),
    fxRateUsdThb: newFxRate,
    cumulativeUsTaxPaid: state.cumulativeUsTaxPaid + ftc.usTaxAfterFtc,
    cumulativeThaiTaxPaid: state.cumulativeThaiTaxPaid + thaiTaxThb,
    failed,
    ...(failed && !state.failed ? { failureYear: state.year } : {}),
    ...(state.failed && state.failureYear !== undefined ? { failureYear: state.failureYear } : {}),
  };

  return { state: newState, outcome };
}
