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

  it('every methodology link href matches #methodology/<id>', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    // Add all anchors referenced by results.ts
    ['monte-carlo-defaults', 'ftc-corrected', 'roth-uncertainty', 'roth-conversion-value-test'].forEach((id) => {
      const section = document.createElement('div');
      section.id = id;
      methPanel.appendChild(section);
    });

    renderResults(container, mockInputs);

    // All 6 links should use #methodology/<id> format
    const expectedAnchors = [
      'monte-carlo-defaults',
      'ftc-corrected',
      'monte-carlo-defaults',
      'ftc-corrected',
      'roth-uncertainty',
      'ftc-corrected',
      'roth-conversion-value-test',
    ];

    for (const anchor of expectedAnchors) {
      const link = container.querySelector(`a[href="#methodology/${anchor}"]`);
      expect(link).not.toBeNull();
    }
  });

  it('no link href contains methodology.html', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    ['monte-carlo-defaults', 'ftc-corrected', 'roth-uncertainty', 'roth-conversion-value-test'].forEach((id) => {
      const section = document.createElement('div');
      section.id = id;
      methPanel.appendChild(section);
    });

    renderResults(container, mockInputs);

    const links = container.querySelectorAll('a[href*="methodology.html"]');
    expect(links.length).toBe(0);
  });

  it('clicking a methodology link sets location.hash and switches to methodology tab', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const methPanel = document.querySelector('#methodology-tab') as HTMLElement;
    const ftcSection = document.createElement('div');
    ftcSection.id = 'ftc-corrected';
    methPanel.appendChild(ftcSection);

    renderResults(container, mockInputs);

    // Find a methodology link (FTC link in delta note)
    const link = container.querySelector('a[href="#methodology/ftc-corrected"]');
    expect(link).not.toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link!.dispatchEvent(clickEvent);

    expect(location.hash).toBe('#methodology/ftc-corrected');
    expect(methPanel.classList.contains('hidden')).toBe(false);
  });
});
