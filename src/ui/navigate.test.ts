// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { switchTab, deepLinkToMethodology } from './navigate.js';

function setupDOM(): void {
  document.body.innerHTML = '';
  const inputsBtn = document.createElement('button');
  inputsBtn.className = 'tab';
  inputsBtn.dataset.tab = 'inputs';
  inputsBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(inputsBtn);

  const resultsBtn = document.createElement('button');
  resultsBtn.className = 'tab';
  resultsBtn.dataset.tab = 'results';
  resultsBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(resultsBtn);

  const refBtn = document.createElement('button');
  refBtn.className = 'tab';
  refBtn.dataset.tab = 'references';
  refBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(refBtn);

  const inputsPanel = document.createElement('section');
  inputsPanel.id = 'inputs-tab';
  inputsPanel.className = 'tab-panel hidden';
  document.body.appendChild(inputsPanel);

  const resultsPanel = document.createElement('section');
  resultsPanel.id = 'results-tab';
  resultsPanel.className = 'tab-panel hidden';
  document.body.appendChild(resultsPanel);

  const refPanel = document.createElement('section');
  refPanel.id = 'references-tab';
  refPanel.className = 'tab-panel hidden';
  document.body.appendChild(refPanel);
}

describe('switchTab', () => {
  beforeEach(setupDOM);

  it('switches to references: removes hidden from target, adds hidden to others, sets aria-selected', () => {
    switchTab('references');

    const inputsPanel = document.querySelector('#inputs-tab') as HTMLElement;
    const resultsPanel = document.querySelector('#results-tab') as HTMLElement;
    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    const refBtn = document.querySelector('.tab[data-tab="references"]') as HTMLElement;

    expect(refPanel.classList.contains('hidden')).toBe(false);
    expect(inputsPanel.classList.contains('hidden')).toBe(true);
    expect(resultsPanel.classList.contains('hidden')).toBe(true);
    expect(refBtn.getAttribute('aria-selected')).toBe('true');
  });
});

describe('deepLinkToMethodology', () => {
  beforeEach(setupDOM);

  it('switches to references and scrolls to the anchor element', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    const anchor = document.createElement('div');
    anchor.id = 'us-brackets-2026';
    refPanel.appendChild(anchor);

    deepLinkToMethodology('us-brackets-2026');

    const refPanelAfter = document.querySelector('#references-tab') as HTMLElement;
    expect(refPanelAfter.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('does not throw for a nonexistent anchor but still switches the tab', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    expect(() => deepLinkToMethodology('nonexistent-anchor')).not.toThrow();

    const refPanelAfter = document.querySelector('#references-tab') as HTMLElement;
    expect(refPanelAfter.classList.contains('hidden')).toBe(false);

    scrollSpy.mockRestore();
  });
});
