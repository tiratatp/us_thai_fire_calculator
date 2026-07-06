/**
 * Tests for gap-year-page UI mounting and structure.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { mountGapYearPage } from './gap-year-page.js';

describe('mountGapYearPage', () => {
  it('renders substantial HTML', () => {
    const container = document.createElement('div');
    mountGapYearPage(container);
    expect(container.innerHTML.length).toBeGreaterThan(2000);
  });

  it('has exactly 5 top-level h2 anchors', () => {
    const container = document.createElement('div');
    mountGapYearPage(container);
    const h2s = container.querySelectorAll('h2[id^="gap-year-"]');
    expect(h2s.length).toBe(5);
    const ids = Array.from(h2s).map(el => el.id).sort();
    expect(ids).toEqual([
      'gap-year-caveats',
      'gap-year-how',
      'gap-year-references',
      'gap-year-what',
      'gap-year-when',
    ]);
  });

  it('has all 10 preserved subsection anchors', () => {
    const container = document.createElement('div');
    mountGapYearPage(container);
    const allIds = new Set(
      Array.from(container.querySelectorAll('*[id]')).map(el => el.id),
    );
    const expected = [
      'gap-year-events',
      'gap-year-trad',
      'gap-year-roth',
      'gap-year-ltcg',
      'gap-year-both',
      'gap-year-destinations',
      'gap-year-threshold',
      'gap-year-age-cap',
      'gap-year-invariants',
      'gap-year-not-modeled',
    ];
    for (const id of expected) {
      expect(allIds.has(id)).toBe(true);
    }
  });

  it('has a <nav> TOC with 5 links that all resolve', () => {
    const container = document.createElement('div');
    mountGapYearPage(container);
    document.body.appendChild(container);

    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();

    const links = nav!.querySelectorAll('a');
    expect(links.length).toBe(5);

    for (const link of links) {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      if (href?.startsWith('#')) {
        const id = href.slice(1);
        expect(document.getElementById(id)).not.toBeNull();
      }
    }
  });
});
