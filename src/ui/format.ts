const USD_FMT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const THB_FMT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return USD_FMT.format(amount);
}

export function formatThb(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return THB_FMT.format(amount);
}

export function formatNumber(amount: number, decimals: number = 0): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(amount);
}

export function formatPercent(fraction: number): string {
  if (!Number.isFinite(fraction)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
}
