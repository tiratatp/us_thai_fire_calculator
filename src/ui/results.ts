import type { SimResult } from '../types.js';
import { formatPercent, formatUsd } from './format.js';

export interface ResultsInputs {
  readonly optimistic: SimResult;
  readonly pessimistic: SimResult;
  readonly successThreshold: number;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function verdict(inputs: ResultsInputs): 'FIRE' | 'ConditionallyFIRE' | 'NotFIRE' {
  if (inputs.pessimistic.successRate >= inputs.successThreshold) {
    return 'FIRE';
  }
  if (inputs.optimistic.successRate >= inputs.successThreshold) {
    return 'ConditionallyFIRE';
  }
  return 'NotFIRE';
}

export function renderResults(container: HTMLElement, inputs: ResultsInputs): void {
  const v = verdict(inputs);
  
  let badgeHtml = '';
  if (v === 'FIRE') {
    badgeHtml = `<span class="badge badge-success" style="color: green;">FIRE</span>`;
  } else if (v === 'ConditionallyFIRE') {
    badgeHtml = `<span class="badge badge-warning" style="color: orange;">Conditionally FIRE</span>`;
  } else {
    badgeHtml = `<span class="badge badge-danger" style="color: red;">Not FIRE</span>`;
  }

  const delta = Math.abs(inputs.optimistic.successRate - inputs.pessimistic.successRate);

  container.innerHTML = `
    <div class="results-card">
      <h2>Verdict: ${badgeHtml}</h2>
      <div class="results-grid" style="display: flex; gap: 2rem;">
        <div class="result-col">
          <h3>Pessimistic Scenario</h3>
          <p class="success-rate" style="font-size: 2rem; font-weight: bold;">
            <a href="methodology.html#monte-carlo-defaults">${esc(formatPercent(inputs.pessimistic.successRate))}</a>
          </p>
          <p>Median Lifetime Tax: <a href="methodology.html#ftc-corrected">${esc(formatUsd(inputs.pessimistic.medianTaxUsd))}</a></p>
        </div>
        <div class="result-col">
          <h3>Optimistic Scenario</h3>
          <p class="success-rate" style="font-size: 2rem; font-weight: bold;">
            <a href="methodology.html#monte-carlo-defaults">${esc(formatPercent(inputs.optimistic.successRate))}</a>
          </p>
          <p>Median Lifetime Tax: <a href="methodology.html#ftc-corrected">${esc(formatUsd(inputs.optimistic.medianTaxUsd))}</a></p>
        </div>
      </div>
      <p class="delta-note" style="margin-top: 1rem;">
        Regulatory exposure delta: <strong><a href="methodology.html#roth-uncertainty">${esc(formatPercent(delta))}</a></strong>.
        <br>
        <small>
          <em>Disclaimer: Not tax advice; Roth Thai treatment unsettled.</em>
          See <a href="methodology.html#ftc-corrected">FTC</a> and <a href="methodology.html#roth-conversion-value-test">Roth</a> methodology.
        </small>
      </p>
    </div>
  `;
}
