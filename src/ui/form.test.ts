// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountForm, loadInitialInputs, saveInputs } from './form.js';
import { parseFormData, validateField } from './form-schema.js';
import { DEFAULT_USER_INPUTS } from '../data/defaults.js';
import type { UserInputs } from '../types.js';

const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', mockStorage);

describe('form', () => {
  beforeEach(() => {
    mockStorage.clear();
    document.body.innerHTML = '<div id="container"></div>';
  });

  it('round-trip persistence', () => {
    const inputs: UserInputs = {
      ...DEFAULT_USER_INPUTS,
      currentAge: 40,
      accounts: [{ id: 'a1', type: 'Cash', currency: 'THB', balance: 1000, pre2024Snapshot: 500 }]
    };
    saveInputs(inputs);
    expect(loadInitialInputs()).toEqual(inputs);
  });

  it('retirement snapshot disabled', () => {
    const container = document.getElementById('container')!;
    mountForm(container, () => {});

    const addBtn = container.querySelector('#add-account') as HTMLButtonElement;
    addBtn.click();

    const row = container.querySelector('.account-row') as HTMLElement;
    const typeSelect = row.querySelector('.account-type-select') as HTMLSelectElement;
    const pre2024Input = row.querySelector('.pre2024-input') as HTMLInputElement;

    expect(pre2024Input.disabled).toBe(false);

    typeSelect.value = 'TraditionalIRA';
    typeSelect.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pre2024Input.disabled).toBe(true);

    typeSelect.value = 'Cash';
    typeSelect.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pre2024Input.disabled).toBe(false);

    typeSelect.value = 'Roth401k';
    typeSelect.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pre2024Input.disabled).toBe(true);
  });

  it('validation rejects negatives', () => {
    expect(validateField({ id: 'balance', type: 'number', min: 0, section: 'accounts', label: 'Balance' }, '-100')).not.toBeNull();
    expect(validateField({ id: 'balance', type: 'number', min: 0, section: 'accounts', label: 'Balance' }, '100')).toBeNull();
  });

  it('validateField and parseFormData strip commas from numbers', () => {
    expect(validateField({ id: 'balance', type: 'number', min: 0, max: 10000000, section: 'accounts', label: 'Balance' }, '1,000,000')).toBeNull();
    expect(validateField({ id: 'balance', type: 'number', min: 0, max: 500000, section: 'accounts', label: 'Balance' }, '1,000,000')).not.toBeNull();

    const fd = new FormData();
    fd.append('currentAge', '40');
    fd.append('lifeExpectancy', '90');
    fd.append('account_id', 'a1');
    fd.append('account_type_a1', 'TaxableBrokerage');
    fd.append('account_currency_a1', 'USD');
    fd.append('account_balance_a1', '1,000,000');
    fd.append('account_basis_a1', '500,000');
    fd.append('account_pre2024_a1', '200,000');
    fd.append('housingThbMo', '10,000');
    fd.append('foodThbMo', '5,000');
    fd.append('transportThbMo', '2,000');
    fd.append('otherThbMo', '1,000');
    fd.append('healthcareThbYr', '20,000');
    fd.append('legalTaxThbYr', '5,000');
    fd.append('travelUsdYr', '3,000');
    fd.append('successThreshold', '0.95');
    fd.append('monteCarloTrials', '5,000');
    fd.append('regulatoryStance', 'optimistic');
    fd.append('currentFxUsdThb', '33');

    const inputs = parseFormData(fd);
    expect(inputs.currentAge).toBe(40);
    expect(inputs.accounts[0]!.balance).toBe(1000000);
    expect(inputs.accounts[0]!.basis).toBe(500000);
    expect(inputs.accounts[0]!.pre2024Snapshot).toBe(200000);
    expect(inputs.expenses.housingThbMo).toBe(10000);
    expect(inputs.expenses.foodThbMo).toBe(5000);
    expect(inputs.monteCarloTrials).toBe(5000);
  });

  it('age validation', () => {
    const container = document.getElementById('container')!;
    mountForm(container, () => {});

    const currentAgeInput = container.querySelector('input[name="currentAge"]') as HTMLInputElement;
    const lifeExpectancyInput = container.querySelector('input[name="lifeExpectancy"]') as HTMLInputElement;
    const submitBtn = container.querySelector('#submit-btn') as HTMLButtonElement;

    currentAgeInput.value = '50';
    currentAgeInput.dispatchEvent(new Event('input', { bubbles: true }));

    lifeExpectancyInput.value = '40';
    lifeExpectancyInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(submitBtn.disabled).toBe(true);
    expect(lifeExpectancyInput.classList.contains('invalid')).toBe(true);
  });

  it('parseFormData round-trip', () => {
    const fd = new FormData();
    fd.append('currentAge', '40');
    fd.append('lifeExpectancy', '90');
    fd.append('account_id', 'a1');
    fd.append('account_type_a1', 'TaxableBrokerage');
    fd.append('account_currency_a1', 'USD');
    fd.append('account_balance_a1', '10000');
    fd.append('account_basis_a1', '5000');
    fd.append('account_pre2024_a1', '2000');
    fd.append('housingThbMo', '10000');
    fd.append('foodThbMo', '5000');
    fd.append('transportThbMo', '2000');
    fd.append('otherThbMo', '1000');
    fd.append('healthcareThbYr', '20000');
    fd.append('legalTaxThbYr', '5000');
    fd.append('travelUsdYr', '3000');
    fd.append('successThreshold', '0.95');
    fd.append('monteCarloTrials', '5000');
    fd.append('regulatoryStance', 'optimistic');

    const inputs = parseFormData(fd);
    expect(inputs.currentAge).toBe(40);
    // birthYear is computed at module load time as `new Date().getFullYear() - currentAge`.
    // The source module is evaluated before this test runs, so use the same fixed year.
    expect(inputs.birthYear).toBe(new Date().getFullYear() - 40);
    expect(inputs.accounts).toHaveLength(1);
    expect(inputs.accounts[0]).toEqual({
      id: 'a1',
      type: 'TaxableBrokerage',
      currency: 'USD',
      balance: 10000,
      basis: 5000,
      pre2024Snapshot: 2000
    });
    expect(inputs.expenses.housingThbMo).toBe(10000);
    expect(inputs.thaiResidencyByYear).toHaveLength(50);
    expect(inputs.thaiResidencyByYear.every(r => r === true)).toBe(true);
  });

  it('renders FX input with correct defaults', () => {
    const container = document.getElementById('container')!;
    mountForm(container, () => {});

    const fxInput = container.querySelector('input[name="currentFxUsdThb"]') as HTMLInputElement;
    expect(fxInput).not.toBeNull();
    expect(fxInput.min).toBe('20');
    expect(fxInput.max).toBe('50');
    expect(fxInput.step).toBe('0.1');
    expect(Number(fxInput.value)).toBe(33);
  });

  it('shows live summary with correct values', () => {
    const container = document.getElementById('container')!;
    mountForm(container, () => {});

    const summary = container.querySelector('#live-summary')!;
    expect(summary.innerHTML).toContain('Total Assets:');
    expect(summary.innerHTML).toContain('Total Expenses:');
    expect(summary.innerHTML).toContain('FIRE Target:');
    expect(summary.innerHTML).toContain('fire-multipliers');
  });

  it('summary updates on input change', () => {
    const container = document.getElementById('container')!;
    mountForm(container, () => {});

    const summary = container.querySelector('#live-summary')!;
    const initialHTML = summary.innerHTML;

    const fxInput = container.querySelector('input[name="currentFxUsdThb"]') as HTMLInputElement;
    fxInput.value = '30';
    fxInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(summary.innerHTML).not.toBe(initialHTML);
    expect(summary.innerHTML).toContain('FIRE Target:');
  });

  it('summary calculates correct values', () => {
    const container = document.getElementById('container')!;
    const inputs: UserInputs = {
      ...DEFAULT_USER_INPUTS,
      currentAge: 40,
      lifeExpectancy: 70, // 30 year horizon -> 25x multiplier
      currentFxUsdThb: 30,
      accounts: [
        { id: 'a1', type: 'Cash', currency: 'USD', balance: 100000 },
        { id: 'a2', type: 'Cash', currency: 'THB', balance: 3000000 }, // 100k USD
      ],
      expenses: {
        housingThbMo: 30000, // 1k USD/mo -> 12k USD/yr
        foodThbMo: 0,
        transportThbMo: 0,
        otherThbMo: 0,
        healthcareThbYr: 30000, // 1k USD/yr
        legalTaxThbYr: 0,
        travelUsdYr: 5000,
      }
    };
    saveInputs(inputs);
    mountForm(container, () => {});

    const summary = container.querySelector('#live-summary')!;
    // Total Assets: 100k + (3M / 30) = 200k
    expect(summary.innerHTML).toContain('$200,000');
    // Total Expenses: 5k + (30k * 12 / 30) + (30k / 30) = 5k + 12k + 1k = 18k
    expect(summary.innerHTML).toContain('$18,000');
    // FIRE Target: 18k * 33 = 594k
    expect(summary.innerHTML).toContain('$594,000');
  });
});
