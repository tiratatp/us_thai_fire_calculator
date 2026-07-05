import type { Account } from '../types.js';
import { ACCOUNT_TYPES, CURRENCIES } from './form-schema.js';

export function renderAccount(acc: Account): string {
  return `
    <div class="account-row flex gap-2 items-end border p-2 rounded" data-id="${acc.id}">
      <input type="hidden" name="account_id" value="${acc.id}">
      <label class="block flex-1">
        <span class="text-xs">Type</span>
        <select name="account_type_${acc.id}" class="account-type-select block w-full text-sm">
          ${ACCOUNT_TYPES.map(t => `<option value="${t.value}" ${acc.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>
      </label>
      <label class="block w-24">
        <span class="text-xs">Currency</span>
        <select name="account_currency_${acc.id}" class="block w-full text-sm">
          ${CURRENCIES.map(c => `<option value="${c.value}" ${acc.currency === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </label>
      <label class="block flex-1">
        <span class="text-xs">Balance</span>
        <input type="number" name="account_balance_${acc.id}" value="${acc.balance}" min="0" class="block w-full text-sm">
      </label>
      <label class="block flex-1">
        <span class="text-xs">Basis</span>
        <input type="number" name="account_basis_${acc.id}" value="${acc.basis ?? ''}" min="0" class="basis-input block w-full text-sm" ${acc.type !== 'TaxableBrokerage' ? 'disabled' : ''}>
      </label>
      <label class="block flex-1" title="Grandfathering (Paw 162/2566) does not apply to retirement accounts.">
        <span class="text-xs">Pre-2024 Snapshot ℹ️</span>
        <input type="number" name="account_pre2024_${acc.id}" value="${acc.pre2024Snapshot ?? ''}" min="0" class="pre2024-input block w-full text-sm" ${acc.type !== 'Cash' && acc.type !== 'TaxableBrokerage' ? 'disabled' : ''}>
      </label>
      <button type="button" class="remove-account px-2 py-1 bg-red-500 text-white rounded text-sm">X</button>
    </div>
  `;
}
