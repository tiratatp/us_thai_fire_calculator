// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrap } from './main.js';

function setupDOM(): void {
  document.body.innerHTML = '';

  // Tabs (nav buttons)
  const inputsBtn = document.createElement('button');
  inputsBtn.className = 'tab';
  inputsBtn.dataset.tab = 'inputs';
  inputsBtn.setAttribute('aria-selected', 'true');
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

  // Tab panels
  const inputsPanel = document.createElement('section');
  inputsPanel.id = 'inputs-tab';
  inputsPanel.className = 'tab-panel';
  document.body.appendChild(inputsPanel);

  const resultsPanel = document.createElement('section');
  resultsPanel.id = 'results-tab';
  resultsPanel.className = 'tab-panel hidden';
  document.body.appendChild(resultsPanel);

  const methPanel = document.createElement('section');
  methPanel.id = 'methodology-tab';
  methPanel.className = 'tab-panel hidden';
  document.body.appendChild(methPanel);

  // Containers needed by mountForm / mountMethodologyPage
  const formContainer = document.createElement('div');
  formContainer.id = 'user-inputs';
  document.body.appendChild(formContainer);

  const methContainer = document.createElement('div');
  methContainer.id = 'methodology-content';
  document.body.appendChild(methContainer);

  // Scroll spy for methodology deep-link target
  const scrollSpy = document.createElement('div');
  scrollSpy.id = 'scroll-spy';
  methPanel.appendChild(scrollSpy);

  // Anchor that deepLinkToMethodology will scroll to
  const anchor = document.createElement('div');
  anchor.id = 'ftc-corrected';
  methPanel.appendChild(anchor);
}

describe('main bootstrap hash handling', () => {
  beforeEach(setupDOM);

  it('switches to methodology tab and scrolls when location.hash is set before bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    location.hash = '#methodology/ftc-corrected';
    bootstrap();

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    expect(methPanel.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('scrolls to new anchor when hash changes after bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    bootstrap();

    location.hash = '#methodology/us-brackets-2026';

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    expect(methPanel.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('does not switch tab for unrelated hash after bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    location.hash = '#foo';
    bootstrap();

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    expect(methPanel.classList.contains('hidden')).toBe(true);
    expect(scrollSpy).not.toHaveBeenCalled();

    scrollSpy.mockRestore();
  });

  it('switches to top-level tab on #results hash', () => {
    location.hash = '#results';
    bootstrap();

    const resultsPanel = document.querySelector('#results-tab') as HTMLElement;
    expect(resultsPanel.classList.contains('hidden')).toBe(false);
  });
});
