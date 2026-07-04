/**
 * Pure-render functions for the methodology page.
 *
 * No DOM dependencies. All output is HTML strings.
 */

import type { Bracket } from '../types.js';
import type { MethodologySection } from './content.js';
import {
  US_ORDINARY_BRACKETS_2026_SINGLE,
  THAI_PIT_BRACKETS,
  RMD_UNIFORM_LIFETIME_TABLE,
} from '../data/constants.js';
import { METHODOLOGY_SECTIONS, CORRELATION_MATRIX } from './content.js';

// ---------- HTML escaping ----------

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Section rendering ----------

export function renderSection(section: MethodologySection): string {
  const paragraphs = section.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('\n');

  const citations = section.citations
    ? `<div class="citations">${section.citations
        .map(
          (c) =>
            `<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener">${escapeHtml(c.text)}</a>`,
        )
        .join(' · ')}</div>`
    : '';

  return `<section id="${section.id}">\n<h2>${escapeHtml(section.title)}</h2>\n${paragraphs}\n${citations}\n</section>\n`;
}

// ---------- Bracket table ----------

export function renderBracketTable(
  brackets: readonly Bracket[],
  currency: 'USD' | 'THB',
): string {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const rows = brackets
    .map(
      (b) => {
        const label =
          b.top === Number.POSITIVE_INFINITY ? 'Over' : fmt.format(b.top);
        return `<tr><td>${escapeHtml(label)}</td><td>${Math.round(b.rate * 100)}%</td></tr>`;
      },
    )
    .join('\n');

  return `<table>\n<thead><tr><th>Top of bracket</th><th>Rate</th></tr></thead>\n<tbody>\n${rows}\n</tbody>\n</table>\n`;
}

// ---------- RMD table (compact 4-column layout) ----------

export function renderRmdTable(): string {
  const divisors = RMD_UNIFORM_LIFETIME_TABLE.value;
  const ages = Object.keys(divisors).map(Number).sort((a, b) => a - b);

  const rows: string[] = [];
  for (let i = 0; i < ages.length; i += 4) {
    const cols = ages.slice(i, i + 4).map((age) => {
      const div = divisors[age]!;
      return `<td>${age}: ${div.toFixed(1)}</td>`;
    });
    rows.push(`<tr>${cols.join('\n')}</tr>`);
  }

  return `<table>\n<thead><tr><th>Age</th><th>Divisor</th><th>Age</th><th>Divisor</th></tr></thead>\n<tbody>\n${rows.join('\n')}\n</tbody>\n</table>\n`;
}

// ---------- Correlation matrix ----------

export function renderCorrelationMatrix(): string {
  const labels = ['US Stock', 'US Bond', 'Intl', 'Cash'];
  let html = '<table>\n<thead><tr><th></th>';
  for (const label of labels) {
    html += `<th>${escapeHtml(label)}</th>`;
  }
  html += '</tr></thead>\n<tbody>';

  for (let r = 0; r < 4; r++) {
    const row = CORRELATION_MATRIX[r]!;
    html += `<tr><th>${escapeHtml(labels[r]!)}</th>`;
    for (let c = 0; c < 4; c++) {
      html += `<td>${row[c]!.toFixed(2)}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody>\n</table>\n';
  return html;
}

// ---------- Full methodology page ----------

export function renderMethodology(): string {
  const tocItems = METHODOLOGY_SECTIONS.map(
    (s) => `<li><a href="#${s.id}">${escapeHtml(s.title)}</a></li>`,
  ).join('\n');

  const toc = `<nav><h2>Table of Contents</h2><ol>\n${tocItems}\n</ol></nav>\n`;

  const sections = METHODOLOGY_SECTIONS.map((s) => renderSection(s)).join('\n');

  // Inject bracket tables for sections that reference constants
  const usBracketsHtml = renderBracketTable(
    US_ORDINARY_BRACKETS_2026_SINGLE.value,
    'USD',
  );
  const thaiBracketsHtml = renderBracketTable(THAI_PIT_BRACKETS.value, 'THB');

  // RMD and correlation tables
  const rmdHtml = renderRmdTable();
  const corrHtml = renderCorrelationMatrix();

  return `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Methodology</title></head>\n<body>\n<h1>Methodology</h1>\n${toc}${sections}\n<!-- Injected constant tables -->\n<div id="constant-tables">\n<h2>US Ordinary Brackets 2026</h2>\n${usBracketsHtml}\n<h2>Thai PIT Brackets</h2>\n${thaiBracketsHtml}\n<h2>RMD Uniform Lifetime Table</h2>\n${rmdHtml}\n<h2>Correlation Matrix</h2>\n${corrHtml}\n</div>\n</body>\n</html>\n`;
}

// ---------- Anchor set ----------

export function methodologyAnchorSet(): ReadonlySet<string> {
  return new Set(METHODOLOGY_SECTIONS.map((s) => s.id));
}
