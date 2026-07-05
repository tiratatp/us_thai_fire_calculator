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
    fd.append('birthYear', '1980');
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

    for (let i = 0; i < 50; i++) {
      fd.append(`residency_${i}`, 'on');
    }

    const inputs = parseFormData(fd);
    expect(inputs.currentAge).toBe(40);
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
});
