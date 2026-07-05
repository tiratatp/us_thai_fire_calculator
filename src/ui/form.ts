import type { UserInputs } from '../types.js';
import { DEFAULT_USER_INPUTS } from '../data/defaults.js';
import { save, restore } from '../storage.js';
import { ACCOUNT_TYPES, CURRENCIES, REGULATORY_STANCES, parseFormData, validateField } from './form-schema.js';
import { renderAccount } from './form-account.js';
import { formatUsd } from './format.js';
import { FIRE_MULTIPLIER_30_YR, FIRE_MULTIPLIER_LONG } from '../data/constants.js';

const STORAGE_KEY = 'v1_inputs';

export function loadInitialInputs(): UserInputs {
  return restore(STORAGE_KEY, DEFAULT_USER_INPUTS);
}

export function saveInputs(inputs: UserInputs): void {
  save(STORAGE_KEY, inputs);
}

export function mountForm(container: HTMLElement, onSubmit: (inputs: UserInputs) => void): void {
  let inputs = loadInitialInputs();

  const render = () => {
    container.innerHTML = `
      <form id="fire-form" class="space-y-6">
        <section>
          <h2 class="text-xl font-bold">Basics</h2>
          <div class="grid grid-cols-4 gap-4">
            ${renderNumber('currentAge', 'Current Age', inputs.currentAge, 0)}
            ${renderNumber('lifeExpectancy', 'Life Expectancy', inputs.lifeExpectancy, inputs.currentAge + 1)}
            ${renderNumber('birthYear', 'Birth Year', inputs.birthYear, 1900, new Date().getFullYear())}
            ${renderNumber('currentFxUsdThb', 'Current USD/THB', inputs.currentFxUsdThb ?? 33, 20, 50, 0.1)}
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold">Accounts</h2>
          <div id="accounts-container" class="space-y-2">
            ${inputs.accounts.map(renderAccount).join('')}
          </div>
          <button type="button" id="add-account" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add Account</button>
        </section>

        <section>
          <h2 class="text-xl font-bold">Expenses</h2>
          <div class="grid grid-cols-2 gap-4">
            ${renderNumber('housingThbMo', 'Housing (THB/mo)', inputs.expenses.housingThbMo, 0)}
            ${renderNumber('foodThbMo', 'Food (THB/mo)', inputs.expenses.foodThbMo, 0)}
            ${renderNumber('transportThbMo', 'Transport (THB/mo)', inputs.expenses.transportThbMo, 0)}
            ${renderNumber('otherThbMo', 'Other (THB/mo)', inputs.expenses.otherThbMo, 0)}
            ${renderNumber('healthcareThbYr', 'Healthcare (THB/yr)', inputs.expenses.healthcareThbYr, 0)}
            ${renderNumber('legalTaxThbYr', 'Legal/Tax (THB/yr)', inputs.expenses.legalTaxThbYr, 0)}
            ${renderNumber('travelUsdYr', 'Travel (USD/yr)', inputs.expenses.travelUsdYr, 0)}
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold">Residency</h2>
          <div class="flex flex-wrap gap-2">
            ${Array.from({ length: Math.max(0, inputs.lifeExpectancy - inputs.currentAge) }, (_, i) => `
              <label class="flex items-center space-x-1">
                <input type="checkbox" name="residency_${i}" ${inputs.thaiResidencyByYear[i] !== false ? 'checked' : ''}>
                <span>Age ${inputs.currentAge + i}</span>
              </label>
            `).join('')}
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold">Assumptions</h2>
          <div class="grid grid-cols-4 gap-4">
            ${renderNumber('monteCarloTrials', 'MC Trials', inputs.monteCarloTrials, 100, 10000)}
            ${renderNumber('successThreshold', 'Success Threshold', inputs.successThreshold, 0, 1, 0.01)}
            <label class="block">
              <span class="text-sm font-medium">Regulatory Stance</span>
              <select name="regulatoryStance" class="mt-1 block w-full rounded border-gray-300">
                ${REGULATORY_STANCES.map(s => `<option value="${s.value}" ${inputs.regulatoryStance === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </label>
          </div>
        </section>

        <div id="live-summary" class="p-4 bg-gray-50 rounded border"></div>

        <button type="submit" id="submit-btn" class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">Run Simulation</button>
      </form>
    `;
    attachListeners();
  };

  const renderNumber = (name: string, label: string, value: number, min?: number, max?: number, step?: number) => `
    <label class="block">
      <span class="text-sm font-medium">${label}</span>
      <input type="number" name="${name}" value="${value}"
        ${min !== undefined ? `min="${min}"` : ''}
        ${max !== undefined ? `max="${max}"` : ''}
        ${step !== undefined ? `step="${step}"` : ''}
        class="mt-1 block w-full rounded border-gray-300">
      <span class="error-msg text-red-500 text-xs hidden"></span>
    </label>
  `;

  const updateSummary = () => {
    const fx = inputs.currentFxUsdThb ?? 33;
    const totalAssetUsd = inputs.accounts.reduce((sum, a) =>
      sum + (a.currency === 'THB' ? a.balance / fx : a.balance), 0);
    const totalExpenseUsd = inputs.expenses.travelUsdYr
      + (inputs.expenses.housingThbMo + inputs.expenses.foodThbMo
        + inputs.expenses.transportThbMo + inputs.expenses.otherThbMo) * 12 / fx
      + (inputs.expenses.healthcareThbYr + inputs.expenses.legalTaxThbYr) / fx;
    const horizon = inputs.lifeExpectancy - inputs.currentAge;
    const multiplier = horizon <= 30 ? FIRE_MULTIPLIER_30_YR.value : FIRE_MULTIPLIER_LONG.value;
    const fireTargetUsd = totalExpenseUsd * multiplier;
    container.querySelector('#live-summary')!.innerHTML = `
      <p><strong>Total Assets:</strong> ${formatUsd(totalAssetUsd)}</p>
      <p><strong>Total Expenses:</strong> ${formatUsd(totalExpenseUsd)}</p>
      <p><strong>FIRE Target:</strong> ${formatUsd(fireTargetUsd)}
        (<a href="#methodology/fire-multipliers" data-methodology-anchor="fire-multipliers">multipliers</a>)</p>
    `;
  };

  const attachListeners = () => {
    const form = container.querySelector('#fire-form') as HTMLFormElement;
    const submitBtn = container.querySelector('#submit-btn') as HTMLButtonElement;

    const validateForm = () => {
      let isValid = true;
      form.querySelectorAll('input[type="number"]').forEach(input => {
        const el = input as HTMLInputElement;
        const errorSpan = el.nextElementSibling as HTMLElement;
        if (el.value.trim() === '' && !el.hasAttribute('required')) {
          el.classList.remove('invalid', 'border-red-500');
          if (errorSpan?.classList.contains('error-msg')) errorSpan.classList.add('hidden');
          return;
        }
        const spec = { id: el.name, type: 'number' as const, min: el.min ? Number(el.min) : undefined, max: el.max ? Number(el.max) : undefined, label: '', section: 'basics' as const };
        const error = validateField(spec, el.value);
        if (error && !el.disabled) {
          isValid = false;
          el.classList.add('invalid', 'border-red-500');
          if (errorSpan?.classList.contains('error-msg')) { errorSpan.textContent = error; errorSpan.classList.remove('hidden'); }
        } else {
          el.classList.remove('invalid', 'border-red-500');
          if (errorSpan?.classList.contains('error-msg')) errorSpan.classList.add('hidden');
        }
      });

      const currentAge = Number((form.elements.namedItem('currentAge') as HTMLInputElement).value);
      const lifeExpectancy = Number((form.elements.namedItem('lifeExpectancy') as HTMLInputElement).value);
      if (lifeExpectancy <= currentAge) {
        isValid = false;
        const leInput = form.elements.namedItem('lifeExpectancy') as HTMLInputElement;
        leInput.classList.add('invalid', 'border-red-500');
        const errorSpan = leInput.nextElementSibling as HTMLElement;
        if (errorSpan) { errorSpan.textContent = 'Must be > Current Age'; errorSpan.classList.remove('hidden'); }
      }

      submitBtn.disabled = !isValid;
      return isValid;
    };

    form.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains('account-type-select')) {
        const row = target.closest('.account-row') as HTMLElement;
        const type = (target as HTMLSelectElement).value;
        const basisInput = row.querySelector('.basis-input') as HTMLInputElement;
        const pre2024Input = row.querySelector('.pre2024-input') as HTMLInputElement;
        basisInput.disabled = type !== 'TaxableBrokerage';
        if (basisInput.disabled) basisInput.value = '';
        pre2024Input.disabled = type !== 'Cash' && type !== 'TaxableBrokerage';
        if (pre2024Input.disabled) pre2024Input.value = '';
      }

      if ((target as HTMLInputElement).name === 'currentAge' || (target as HTMLInputElement).name === 'lifeExpectancy') {
        if (validateForm()) { const fd = new FormData(form); inputs = parseFormData(fd); render(); }
        return;
      }

      if (validateForm()) { const fd = new FormData(form); inputs = parseFormData(fd); updateSummary(); saveInputs(inputs); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm()) { const fd = new FormData(form); inputs = parseFormData(fd); saveInputs(inputs); onSubmit(inputs); }
    });

    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
      if (!btn) return;
      if (btn.id === 'add-account') {
        const newId = Math.random().toString(36).substring(2, 9);
        inputs = { ...inputs, accounts: [...inputs.accounts, { id: newId, type: 'TaxableBrokerage', currency: 'USD', balance: 0 }] };
        render();
      } else if (btn.classList.contains('remove-account')) {
        const row = btn.closest('.account-row') as HTMLElement;
        const id = row.dataset.id;
        inputs = { ...inputs, accounts: inputs.accounts.filter(a => a.id !== id) };
        render();
      }
    });

    validateForm();
    updateSummary();
  };

  render();
}
