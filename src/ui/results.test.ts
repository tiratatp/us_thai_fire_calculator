// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderResults, verdict } from './results.js';
import type { SimResult } from '../types.js';

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

function makeSimResult(successRate: number, medianTaxUsd: number): SimResult {
  return {
    successRate,
    p10: [],
    p50: [],
    p90: [],
    medianTaxUsd,
    failedTrialCount: 0,
    trialsRun: 100,
  };
}

describe('results verdict', () => {
  it('returns FIRE when pessimistic >= threshold', () => {
    const res = verdict({
      pessimistic: makeSimResult(0.92, 0),
      optimistic: makeSimResult(0.95, 0),
      successThreshold: 0.90,
    });
    expect(res).toBe('FIRE');
  });

  it('returns ConditionallyFIRE when optimistic >= threshold but pessimistic < threshold', () => {
    const res = verdict({
      pessimistic: makeSimResult(0.85, 0),
      optimistic: makeSimResult(0.95, 0),
      successThreshold: 0.90,
    });
    expect(res).toBe('ConditionallyFIRE');
  });

  it('returns NotFIRE when optimistic < threshold', () => {
    const res = verdict({
      pessimistic: makeSimResult(0.80, 0),
      optimistic: makeSimResult(0.85, 0),
      successThreshold: 0.90,
    });
    expect(res).toBe('NotFIRE');
  });
});

describe('results methodology links', () => {
  beforeEach(setupDOM);

  const mockInputs = {
    pessimistic: makeSimResult(0.88, 5000),
    optimistic: makeSimResult(0.92, 4500),
    successThreshold: 0.90,
  };

  it('every methodology link href matches #references/<id>', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    // Add all anchors referenced by results.ts
    ['monte-carlo-defaults', 'ftc-corrected', 'roth-uncertainty'].forEach((id) => {
      const section = document.createElement('div');
      section.id = id;
      refPanel.appendChild(section);
    });

    renderResults(container, mockInputs);

    const expectedAnchors = [
      'monte-carlo-defaults',
      'ftc-corrected',
      'monte-carlo-defaults',
      'ftc-corrected',
      'roth-uncertainty',
      'ftc-corrected',
    ];

    for (const anchor of expectedAnchors) {
      const link = container.querySelector(`a[href="#references/${anchor}"]`);
      expect(link).not.toBeNull();
    }
  });

  it('no link href contains methodology.html', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    ['monte-carlo-defaults', 'ftc-corrected', 'roth-uncertainty'].forEach((id) => {
      const section = document.createElement('div');
      section.id = id;
      refPanel.appendChild(section);
    });

    renderResults(container, mockInputs);

    const links = container.querySelectorAll('a[href*="methodology.html"]');
    expect(links.length).toBe(0);
  });

  it('clicking a methodology link sets location.hash and switches to references tab', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const refPanel = document.querySelector('#references-tab') as HTMLElement;
    const ftcSection = document.createElement('div');
    ftcSection.id = 'ftc-corrected';
    refPanel.appendChild(ftcSection);

    renderResults(container, mockInputs);

    // Find a methodology link (FTC link in delta note)
    const link = container.querySelector('a[href="#references/ftc-corrected"]');
    expect(link).not.toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link!.dispatchEvent(clickEvent);

    expect(location.hash).toBe('#references/ftc-corrected');
    expect(refPanel.classList.contains('hidden')).toBe(false);
  });
});
