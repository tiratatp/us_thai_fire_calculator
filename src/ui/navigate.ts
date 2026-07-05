export type TabId = 'inputs' | 'results' | 'methodology';

export function switchTab(target: TabId): void {
  document.querySelectorAll<HTMLElement>('.tab').forEach((el) => {
    const active = el.dataset.tab === target;
    el.classList.toggle('active', active);
    el.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll<HTMLElement>('.tab-panel').forEach((el) => {
    const active = el.id === `${target}-tab`;
    el.classList.toggle('hidden', !active);
  });
}

export function deepLinkToMethodology(id: string): void {
  switchTab('methodology');
  const container = document.querySelector<HTMLElement>('#methodology-tab');
  if (!container) return;
  // Attribute selector avoids CSS.escape incompatibility in jsdom.
  const el = container.querySelector<HTMLElement>(`[id="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
