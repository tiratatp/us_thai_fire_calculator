import type { SimResult } from '../types.js';
import { formatPercent, formatUsd } from './format.js';
import { deepLinkToMethodology } from './navigate.js';

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

  const anchors = [
    { id: 'monte-carlo-defaults', text: formatPercent(inputs.pessimistic.successRate) },
    { id: 'ftc-corrected', text: formatUsd(inputs.pessimistic.medianTaxUsd) },
    { id: 'monte-carlo-defaults', text: formatPercent(inputs.optimistic.successRate) },
    { id: 'ftc-corrected', text: formatUsd(inputs.optimistic.medianTaxUsd) },
    { id: 'roth-uncertainty', text: formatPercent(delta) },
    { id: 'ftc-corrected', text: 'FTC' },
  ];

  container.innerHTML = `
    <div class="results-card">
      <h2>Verdict: ${badgeHtml}</h2>
      <div class="results-grid" style="display: flex; gap: 2rem;">
        <div class="result-col">
          <h3>Pessimistic Scenario</h3>
          <p class="success-rate" style="font-size: 2rem; font-weight: bold;">
            <a href="#references/${esc(anchors[0]!.id)}" data-methodology-anchor="${esc(anchors[0]!.id)}">${esc(anchors[0]!.text)}</a>
          </p>
          <p>Median Lifetime Tax: <a href="#references/${esc(anchors[1]!.id)}" data-methodology-anchor="${esc(anchors[1]!.id)}">${esc(anchors[1]!.text)}</a></p>
        </div>
        <div class="result-col">
          <h3>Optimistic Scenario</h3>
          <p class="success-rate" style="font-size: 2rem; font-weight: bold;">
            <a href="#references/${esc(anchors[2]!.id)}" data-methodology-anchor="${esc(anchors[2]!.id)}">${esc(anchors[2]!.text)}</a>
          </p>
          <p>Median Lifetime Tax: <a href="#references/${esc(anchors[3]!.id)}" data-methodology-anchor="${esc(anchors[3]!.id)}">${esc(anchors[3]!.text)}</a></p>
        </div>
      </div>
      <p class="delta-note" style="margin-top: 1rem;">
        Regulatory exposure delta: <strong><a href="#references/${esc(anchors[4]!.id)}" data-methodology-anchor="${esc(anchors[4]!.id)}">${esc(anchors[4]!.text)}</a></strong>.
        <br>
        <small>
          <em>Disclaimer: Not tax advice; Roth Thai treatment unsettled.</em>
          See <a href="#references/${esc(anchors[5]!.id)}" data-methodology-anchor="${esc(anchors[5]!.id)}">${esc(anchors[5]!.text)}</a> methodology.
        </small>
      </p>
    </div>
  `;

  container.addEventListener('click', (e) => {
    const t = e.target instanceof HTMLElement
      ? e.target.closest<HTMLElement>('a[data-methodology-anchor]')
      : null;
    if (!t) return;
    e.preventDefault();
    const id = t.dataset.methodologyAnchor;
    if (!id) return;
    history.pushState(null, '', `#references/${id}`);
    deepLinkToMethodology(id);
  });
}
