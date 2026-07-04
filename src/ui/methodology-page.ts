/**
 * Mounts the methodology page into a DOM container.
 */

import { renderMethodology } from '../methodology/render.js';

export function mountMethodologyPage(container: HTMLElement): void {
  container.innerHTML = renderMethodology();

  // Smooth scroll to anchor targets
  container.addEventListener('click', (e) => {
    const target = e.target instanceof HTMLElement
      ? e.target.closest('a[href^="#"]')
      : null;
    if (!target) return;
    e.preventDefault();
    const id = target.getAttribute('href')!.slice(1);
    const el = container.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
