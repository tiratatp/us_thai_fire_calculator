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

  const methBtn = document.createElement('button');
  methBtn.className = 'tab';
  methBtn.dataset.tab = 'methodology';
  methBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(methBtn);

  const inputsPanel = document.createElement('section');
  inputsPanel.id = 'inputs-tab';
  inputsPanel.className = 'tab-panel hidden';
  document.body.appendChild(inputsPanel);

  const resultsPanel = document.createElement('section');
  resultsPanel.id = 'results-tab';
  resultsPanel.className = 'tab-panel hidden';
  document.body.appendChild(resultsPanel);

  const methPanel = document.createElement('section');
  methPanel.id = 'methodology-tab';
  methPanel.className = 'tab-panel hidden';
  document.body.appendChild(methPanel);
}

describe('switchTab', () => {
  beforeEach(setupDOM);

  it('switches to methodology: removes hidden from target, adds hidden to others, sets aria-selected', () => {
    switchTab('methodology');

    const inputsPanel = document.querySelector('#inputs-tab') as HTMLElement;
    const resultsPanel = document.querySelector('#results-tab') as HTMLElement;
    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    const methBtn = document.querySelector('.tab[data-tab="methodology"]') as HTMLElement;

    expect(methPanel.classList.contains('hidden')).toBe(false);
    expect(inputsPanel.classList.contains('hidden')).toBe(true);
    expect(resultsPanel.classList.contains('hidden')).toBe(true);
    expect(methBtn.getAttribute('aria-selected')).toBe('true');
  });
});

describe('deepLinkToMethodology', () => {
  beforeEach(setupDOM);

  it('switches to methodology and scrolls to the anchor element', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    // Add an anchor inside the methodology panel
    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    const anchor = document.createElement('div');
    anchor.id = 'us-brackets-2026';
    methPanel.appendChild(anchor);

    deepLinkToMethodology('us-brackets-2026');

    const methPanelAfter = document.querySelector('#methodology-tab') as HTMLElement;
    expect(methPanelAfter.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('does not throw for a nonexistent anchor but still switches the tab', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    expect(() => deepLinkToMethodology('nonexistent-anchor')).not.toThrow();

    const methPanelAfter = document.querySelector('#methodology-tab') as HTMLElement;
    expect(methPanelAfter.classList.contains('hidden')).toBe(false);

    scrollSpy.mockRestore();
  });
});
