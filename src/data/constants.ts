/**
 * Numeric constants — single source of truth.
 *
 * Every value is wrapped in Cited<T> so the methodology page can render
 * the exact number the engine uses next to its authoritative URL.
 *
 * Sources: .research/01-us-federal-tax.md, .research/02-thai-tax.md.
 */

import type { Bracket, Cited, LtcgThresholds } from '../types.js';

const IRS_2026_URL =
  'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill';
const IRS_P17_URL = 'https://www.irs.gov/pub/irs-pdf/p17.pdf';
const IRS_LTCG_URL = 'https://www.irs.gov/taxtopics/tc409';
const IRS_STDDED_URL = 'https://www.irs.gov/taxtopics/tc551';
const IRS_NIIT_URL = 'https://www.irs.gov/taxtopics/tc559';
const IRS_P590B_URL = 'https://www.irs.gov/publications/p590b';
const IRS_P969_URL = 'https://www.irs.gov/publications/p969';
const IRS_72T_URL =
  'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions';
const RD_TH_URL = 'https://www.rd.go.th/english/6045';
const PWC_TH_URL = 'https://taxsummaries.pwc.com/thailand/individual/deductions';
const PAW_162_URL =
  'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf';
const RETRIEVED = '2026-07-04';

// ---------- US ordinary brackets ----------

export const US_ORDINARY_BRACKETS_2025_SINGLE: Cited<readonly Bracket[]> = {
  value: [
    { top: 11925, rate: 0.10 },
    { top: 48475, rate: 0.12 },
    { top: 103350, rate: 0.22 },
    { top: 197300, rate: 0.24 },
    { top: 250525, rate: 0.32 },
    { top: 626350, rate: 0.35 },
    { top: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
  sourceUrl: IRS_P17_URL,
  sourceName: 'IRS Publication 17 (2025)',
  retrievedDate: RETRIEVED,
  notes: 'Single filer, tax year 2025.',
};

export const US_ORDINARY_BRACKETS_2026_SINGLE: Cited<readonly Bracket[]> = {
  value: [
    { top: 12225, rate: 0.10 },
    { top: 49725, rate: 0.12 },
    { top: 106150, rate: 0.22 },
    { top: 202875, rate: 0.24 },
    { top: 257475, rate: 0.32 },
    { top: 644675, rate: 0.35 },
    { top: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
  sourceUrl: IRS_2026_URL,
  sourceName: 'IRS Rev. Proc. — 2026 inflation adjustments (OBBBA)',
  retrievedDate: RETRIEVED,
  notes: 'Single filer, tax year 2026 (post-OBBBA).',
};

// ---------- US LTCG thresholds (single) ----------

export const US_LTCG_BRACKETS_2025_SINGLE: Cited<LtcgThresholds> = {
  value: { zeroTop: 48350, fifteenTop: 533400 },
  sourceUrl: IRS_LTCG_URL,
  sourceName: 'IRS Topic No. 409',
  retrievedDate: RETRIEVED,
  notes: '0% below zeroTop, 15% up to fifteenTop, 20% above.',
};

export const US_LTCG_BRACKETS_2026_SINGLE: Cited<LtcgThresholds> = {
  value: { zeroTop: 49450, fifteenTop: 545500 },
  sourceUrl: IRS_2026_URL,
  sourceName: 'IRS Rev. Proc. — 2026 inflation adjustments',
  retrievedDate: RETRIEVED,
  notes: 'Single filer, tax year 2026.',
};

// ---------- Standard deduction ----------

export const US_STD_DED_2025_SINGLE: Cited<number> = {
  value: 15750,
  sourceUrl: IRS_STDDED_URL,
  sourceName: 'IRS Topic No. 551',
  retrievedDate: RETRIEVED,
  notes: 'Single filer, tax year 2025 (post-OBBBA).',
};

export const US_STD_DED_2026_SINGLE: Cited<number> = {
  value: 16100,
  sourceUrl: IRS_2026_URL,
  sourceName: 'IRS Rev. Proc. — 2026 inflation adjustments',
  retrievedDate: RETRIEVED,
  notes: 'Single filer, tax year 2026. Plan doc used 15750; corrected per IRS.',
};

// ---------- NIIT ----------

export const US_NIIT_RATE: Cited<number> = {
  value: 0.038,
  sourceUrl: IRS_NIIT_URL,
  sourceName: 'IRS Topic No. 559 (IRC §1411)',
  retrievedDate: RETRIEVED,
};

export const US_NIIT_THRESHOLD_SINGLE: Cited<number> = {
  value: 200000,
  sourceUrl: IRS_NIIT_URL,
  sourceName: 'IRS Topic No. 559',
  retrievedDate: RETRIEVED,
  notes: 'Not inflation-adjusted.',
};

// ---------- RMD Uniform Lifetime Table ----------

/** Ages 72 through 120+ (age 120 divisor applies for ages ≥ 120). */
export const RMD_UNIFORM_LIFETIME_TABLE: Cited<Readonly<Record<number, number>>> = {
  value: Object.freeze({
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
    79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
    86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
    93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
    100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
    107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
    114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
  }),
  sourceUrl: IRS_P590B_URL,
  sourceName: 'IRS Publication 590-B (Uniform Lifetime Table)',
  retrievedDate: RETRIEVED,
};

/**
 * SECURE 2.0 RMD age by birth year (per .research/01-us-federal-tax.md §5).
 * Before Jul 1, 1951 → 73; Jul 2, 1951 through Dec 31, 1959 → 75;
 * 1960 and later → 75. Whole-year approximation.
 */
export function rmdAgeByBirthYear(birthYear: number): number {
  if (birthYear <= 1950) return 73;
  return 75;
}

export const RMD_AGE_BY_BIRTH_YEAR: Cited<typeof rmdAgeByBirthYear> = {
  value: rmdAgeByBirthYear,
  sourceUrl: IRS_P590B_URL,
  sourceName: 'IRS Publication 590-B — SECURE 2.0 RMD age boundaries',
  retrievedDate: RETRIEVED,
  notes: 'Whole-year approximation. Born 1950 or earlier → 73; born 1951+ → 75.',
};

// ---------- Penalties ----------

export const EARLY_WITHDRAWAL_PENALTY_RATE: Cited<number> = {
  value: 0.10,
  sourceUrl: IRS_72T_URL,
  sourceName: 'IRC §72(t) — 10% additional tax on early distributions',
  retrievedDate: RETRIEVED,
};

export const HSA_PRE_65_PENALTY_RATE: Cited<number> = {
  value: 0.20,
  sourceUrl: IRS_P969_URL,
  sourceName: 'IRS Publication 969',
  retrievedDate: RETRIEVED,
  notes: 'Non-qualified withdrawal pre-65 = 20% penalty + income tax.',
};

export const HSA_MEDICARE_AGE: Cited<number> = {
  value: 65,
  sourceUrl: IRS_P969_URL,
  sourceName: 'IRS Publication 969',
  retrievedDate: RETRIEVED,
};

// ---------- Thai PIT ----------

export const THAI_PIT_BRACKETS: Cited<readonly Bracket[]> = {
  value: [
    { top: 150000, rate: 0.00 },
    { top: 300000, rate: 0.05 },
    { top: 500000, rate: 0.10 },
    { top: 750000, rate: 0.15 },
    { top: 1000000, rate: 0.20 },
    { top: 2000000, rate: 0.25 },
    { top: 4000000, rate: 0.30 },
    { top: Number.POSITIVE_INFINITY, rate: 0.35 },
  ],
  sourceUrl: RD_TH_URL,
  sourceName: 'Thai Revenue Department — Personal Income Tax',
  retrievedDate: RETRIEVED,
  notes: 'Amounts in THB; top brackets 2M-4M @ 30%, >4M @ 35%.',
};

export const THAI_PERSONAL_ALLOWANCE: Cited<number> = {
  value: 60000,
  sourceUrl: PWC_TH_URL,
  sourceName: 'PwC Tax Summaries — Thailand individual deductions',
  retrievedDate: RETRIEVED,
  notes: 'THB, per taxpayer.',
};

export const THAI_PENSION_DEDUCTION_CAP: Cited<number> = {
  value: 100000,
  sourceUrl: PWC_TH_URL,
  sourceName: 'PwC Tax Summaries — Thailand',
  retrievedDate: RETRIEVED,
  notes: 'THB. Combined life+pension+PVD+RMF has higher aggregate cap of 500k.',
};

export const THAI_PENSION_DEDUCTION_PCT: Cited<number> = {
  value: 0.50,
  sourceUrl: PWC_TH_URL,
  sourceName: 'PwC Tax Summaries — Thailand',
  retrievedDate: RETRIEVED,
  notes: '50% of pension assessable, capped at THAI_PENSION_DEDUCTION_CAP.',
};

export const PAW_162_CUTOFF_DATE: Cited<string> = {
  value: '2024-01-01',
  sourceUrl: PAW_162_URL,
  sourceName: 'RD Instruction Paw 162/2566 — pre-2024 grandfathering',
  retrievedDate: RETRIEVED,
  notes:
    'Income earned before this date is not assessable when remitted. Applies to Cash and Taxable Brokerage ONLY — never retirement accounts.',
};

// ---------- FIRE multipliers ----------

const TRINITY_STUDY_URL =
  'https://www.portfoliovisualizer.com/triangle-of-safety';

/** 25× = 4% safe withdrawal rate (1 / 0.04). Used when retirement horizon ≤ 30 years. */
export const FIRE_MULTIPLIER_30_YR: Cited<number> = {
  value: 25,
  sourceUrl: TRINITY_STUDY_URL,
  sourceName: 'Trinity Study — 4% safe withdrawal rate',
  retrievedDate: RETRIEVED,
  notes: '1 / 0.04. Conservative horizon ≤ 30 years.',
};

/** 33× = 3% safe withdrawal rate (1 / 0.03). Used when retirement horizon > 30 years. */
export const FIRE_MULTIPLIER_LONG: Cited<number> = {
  value: 33,
  sourceUrl: TRINITY_STUDY_URL,
  sourceName: 'Trinity Study — 3% conservative withdrawal rate',
  retrievedDate: RETRIEVED,
  notes: '1 / 0.03. Conservative horizon > 30 years.',
};
