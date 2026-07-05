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

  const refBtn = document.createElement('button');
  refBtn.className = 'tab';
  refBtn.dataset.tab = 'references';
  refBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(refBtn);

  const ddBtn = document.createElement('button');
  ddBtn.className = 'tab';
  ddBtn.dataset.tab = 'drawdown';
  ddBtn.setAttribute('aria-selected', 'false');
  document.body.appendChild(ddBtn);

  // Tab panels
  const inputsPanel = document.createElement('section');
  inputsPanel.id = 'inputs-tab';
  inputsPanel.className = 'tab-panel';
  document.body.appendChild(inputsPanel);

  const resultsPanel = document.createElement('section');
  resultsPanel.id = 'results-tab';
  resultsPanel.className = 'tab-panel hidden';
  document.body.appendChild(resultsPanel);

  const refPanel = document.createElement('section');
  refPanel.id = 'references-tab';
  refPanel.className = 'tab-panel hidden';
  document.body.appendChild(refPanel);

  const ddPanel = document.createElement('section');
  ddPanel.id = 'drawdown-tab';
  ddPanel.className = 'tab-panel hidden';
  document.body.appendChild(ddPanel);

  // Containers needed by mountForm / mountMethodologyPage
  const formContainer = document.createElement('div');
  formContainer.id = 'user-inputs';
  document.body.appendChild(formContainer);

  const methContainer = document.createElement('div');
  methContainer.id = 'methodology-content';
  document.body.appendChild(methContainer);

  const scrollSpy = document.createElement('div');
  scrollSpy.id = 'scroll-spy';
  refPanel.appendChild(scrollSpy);

  const anchor = document.createElement('div');
  anchor.id = 'ftc-corrected';
  refPanel.appendChild(anchor);
}

describe('main bootstrap hash handling', () => {
  beforeEach(setupDOM);

  it('switches to references tab and scrolls when location.hash is set before bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    location.hash = '#references/ftc-corrected';
    bootstrap();

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    expect(refPanel.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('scrolls to new anchor when hash changes after bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    bootstrap();

    location.hash = '#references/us-brackets-2026';

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    expect(refPanel.classList.contains('hidden')).toBe(false);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    scrollSpy.mockRestore();
  });

  it('does not switch tab for unrelated hash after bootstrap', () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    location.hash = '#foo';
    bootstrap();

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    expect(refPanel.classList.contains('hidden')).toBe(true);
    expect(scrollSpy).not.toHaveBeenCalled();

    scrollSpy.mockRestore();
  });

  it('switches to top-level tab on #results hash', () => {
    location.hash = '#results';
    bootstrap();

    const resultsPanel = document.querySelector('#results-tab') as HTMLElement;
    expect(resultsPanel.classList.contains('hidden')).toBe(false);
  });

  it('switches to drawdown tab on #drawdown hash', () => {
    location.hash = '#drawdown';
    bootstrap();

    const drawdownPanel = document.querySelector('#drawdown-tab') as HTMLElement;
    expect(drawdownPanel.classList.contains('hidden')).toBe(false);
  });
});
