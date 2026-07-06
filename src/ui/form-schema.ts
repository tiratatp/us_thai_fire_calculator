import type { Account, AccountType, Currency, UserInputs, RegulatoryStance } from '../types.js';

import { DEFAULT_USER_INPUTS } from '../data/defaults.js';

export interface FieldSpec {
  readonly id: string;
  readonly label: string;
  readonly type: 'number' | 'checkbox' | 'select';
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly help?: string;
  readonly section: 'basics' | 'accounts' | 'expenses' | 'residency' | 'assumptions';
  readonly options?: readonly { value: string; label: string }[];
}

export const ACCOUNT_TYPES: readonly { value: AccountType; label: string }[] = [
  { value: 'Cash', label: 'Cash' },
  { value: 'TaxableBrokerage', label: 'Taxable Brokerage' },
  { value: 'Traditional401k', label: 'Traditional 401(k)' },
  { value: 'Roth401k', label: 'Roth 401(k)' },
  { value: 'TraditionalIRA', label: 'Traditional IRA' },
  { value: 'RothIRA', label: 'Roth IRA' },
  { value: 'HSA', label: 'HSA' },
];

export const CURRENCIES: readonly { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD' },
  { value: 'THB', label: 'THB' },
];

export const REGULATORY_STANCES: readonly { value: RegulatoryStance; label: string }[] = [
  { value: 'optimistic', label: 'Optimistic' },
  { value: 'pessimistic', label: 'Pessimistic' },
  { value: 'both', label: 'Both' },
];

function stripCommas(s: string): string {
  return s.replace(/,/g, '');
}

export function validateField(spec: FieldSpec, value: string): string | null {
  if (spec.type === 'number') {
    if (value.trim() === '') return 'Required';
    const num = Number(stripCommas(value));
    if (Number.isNaN(num)) return 'Must be a number';
    if (spec.min !== undefined && num < spec.min) return `Must be >= ${spec.min}`;
    if (spec.max !== undefined && num > spec.max) return `Must be <= ${spec.max}`;
  }
  return null;
}

export function parseFormData(fd: FormData): UserInputs {
  const getNum = (key: string) => Number(String(fd.get(key) || 0).replace(/,/g, ''));
  const getStr = (key: string) => String(fd.get(key) || '');

  const currentAge = getNum('currentAge');
  const lifeExpectancy = getNum('lifeExpectancy');
  
  const accounts: Account[] = [];
  const accountIds = fd.getAll('account_id').map(String);
  for (const id of accountIds) {
    const type = getStr(`account_type_${id}`) as AccountType;
    const currency = getStr(`account_currency_${id}`) as Currency;
    const balance = getNum(`account_balance_${id}`);
    const basisStr = fd.get(`account_basis_${id}`);
    const pre2024Str = fd.get(`account_pre2024_${id}`);
    
    const account: any = { id, type, currency, balance };
    if (type === 'TaxableBrokerage' && basisStr !== null && basisStr !== '') {
      account.basis = Number(String(basisStr).replace(/,/g, ''));
    }
    if ((type === 'Cash' || type === 'TaxableBrokerage') && pre2024Str !== null && pre2024Str !== '') {
      account.pre2024Snapshot = Number(String(pre2024Str).replace(/,/g, ''));
    }
    accounts.push(account as Account);
  }

  // Residency defaults to true for every retirement year. The UI no longer
  // exposes a per-year checkbox grid because the only legitimate reason to
  // spend <180 days in Thailand is a planned "gap year abroad" tax strategy,
  // which we surface as a recommendation in the year-by-year results table
  // rather than as a set-once input (users cannot realistically plan 40 years
  // of residency at input time). See methodology → gap-year-strategy.
  const residency: boolean[] = [];
  const years = Math.max(0, lifeExpectancy - currentAge);
  for (let i = 0; i < years; i++) {
    residency.push(true);
  }

  return {
    currentAge,
    lifeExpectancy,
    birthYear: new Date().getFullYear() - currentAge,
    accounts,
    expenses: {
      housingThbMo: getNum('housingThbMo'),
      foodThbMo: getNum('foodThbMo'),
      transportThbMo: getNum('transportThbMo'),
      otherThbMo: getNum('otherThbMo'),
      healthcareThbYr: getNum('healthcareThbYr'),
      legalTaxThbYr: getNum('legalTaxThbYr'),
      travelUsdYr: getNum('travelUsdYr'),
    },
    thaiResidencyByYear: residency,
    successThreshold: DEFAULT_USER_INPUTS.successThreshold,
    monteCarloTrials: DEFAULT_USER_INPUTS.monteCarloTrials,
    regulatoryStance: DEFAULT_USER_INPUTS.regulatoryStance,
    currentFxUsdThb: getNum('currentFxUsdThb'),
  };
}
