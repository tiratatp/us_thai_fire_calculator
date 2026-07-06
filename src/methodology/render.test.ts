/**
 * Tests for methodology render functions.
 */

import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  renderBracketTable,
  renderMethodology,
  renderRmdTable,
  methodologyAnchorSet,
} from './render.js';
import { US_ORDINARY_BRACKETS_2026_SINGLE } from '../data/constants.js';
import { METHODOLOGY_GROUPS, METHODOLOGY_SECTIONS } from './content.js';

describe('escapeHtml', () => {
  it('escapes script tags', () => {
    const result = escapeHtml('<script>alert(1)</script>');
    expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes ampersand, less-than, greater-than', () => {
    const result = escapeHtml('a & b < c > d');
    expect(result).toContain('&amp;');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });
});

describe('methodologyAnchorSet', () => {
  it('contains all required anchors', () => {
    const anchors = methodologyAnchorSet();
    const required = [
      'disclaimer',
      'us-brackets-2026',
      'us-ltcg-2026',
      'us-rmd-table',
      'thai-pit-brackets',
      'paw-162-grandfathering',
      'ftc-corrected',
      'roth-conversion-value-test',
      'treaty-resourcing',
      'roth-uncertainty',
    ];
    for (const id of required) {
      expect(anchors.has(id)).toBe(true);
    }
  });
});

describe('renderMethodology', () => {
  it('includes disclaimer content', () => {
    const html = renderMethodology();
    expect(html.toLowerCase()).toContain('not tax advice');
    expect(html.toLowerCase()).toContain('unsettled');
  });

  it('includes ftc-corrected primary principle', () => {
    const html = renderMethodology();
    expect(html.toLowerCase()).toContain('primary');
  });

  it('includes residency 180-days lever', () => {
    const html = renderMethodology();
    expect(
      html.toLowerCase().includes('180') || html.includes('<180'),
    ).toBe(true);
    expect(html.toLowerCase()).toContain('under 180 days');
  });

  it('includes roth-conversion-value-test content', () => {
    const html = renderMethodology();
    expect(html.toLowerCase()).toContain('value test');
  });

  it('includes paw-162 warning about retirement accounts', () => {
    const html = renderMethodology();
    const idx = html.indexOf('paw-162-grandfathering');
    const snippet = html.slice(
      idx,
      html.indexOf('</section>', idx) + '</section>'.length,
    ).toLowerCase();
    expect(snippet).toContain('retirement');
    expect(snippet).toContain('not');
  });

  it('has at least 15 https citation links', () => {
    const html = renderMethodology();
    const matches = html.match(/href="https:\/\/[^\"]+"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(15);
  });

  describe('renderMethodology groups', () => {
    it('renders exactly 5 group sections', () => {
      const html = renderMethodology();
      const count = (html.match(/<section class="group"/g) ?? []).length;
      expect(count).toBe(5);
    });

    it('renders one H3 per methodology section', () => {
      const html = renderMethodology();
      const count = (html.match(/<h3/g) ?? []).length;
      expect(count).toBe(METHODOLOGY_SECTIONS.length);
    });

    it('includes nested TOC with at least 6 total lists', () => {
      const html = renderMethodology();
      const count = (html.match(/<ol/g) ?? []).length;
      expect(count).toBeGreaterThanOrEqual(6);
    });

    it('has unique section ids', () => {
      const ids = METHODOLOGY_SECTIONS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('groups cover all sections', () => {
      const groupedCount = METHODOLOGY_GROUPS.flatMap((g) => g.sections).length;
      expect(groupedCount).toBe(METHODOLOGY_SECTIONS.length);
    });
  });
});

describe('renderBracketTable', () => {
  it('renders US 2026 brackets with correct values', () => {
    const html = renderBracketTable(
      US_ORDINARY_BRACKETS_2026_SINGLE.value,
      'USD',
    );
    expect(html).toContain('12,225');
    expect(html).toContain('$');
  });
});

describe('renderRmdTable', () => {
  it('includes age 73 divisor 26.5', () => {
    const html = renderRmdTable();
    expect(html).toContain('26.5');
  });

  it('includes age 74 divisor 25.5', () => {
    const html = renderRmdTable();
    expect(html).toContain('25.5');
  });

  it('includes age 120 divisor 2', () => {
    const html = renderRmdTable();
    expect(html).toContain('2.0');
  });
});
