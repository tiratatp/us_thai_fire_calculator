/**
 * Tests for methodology-page UI mounting.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { mountMethodologyPage } from './methodology-page.js';

describe('mountMethodologyPage', () => {
  it('renders substantial HTML', () => {
    const container = document.createElement('div');
    mountMethodologyPage(container);
    expect(container.innerHTML.length).toBeGreaterThan(5000);
  });

  it('has paw-162-grandfathering section', () => {
    const container = document.createElement('div');
    mountMethodologyPage(container);
    expect(container.querySelector('#paw-162-grandfathering')).not.toBeNull();
  });

  it('has ftc-corrected section', () => {
    const container = document.createElement('div');
    mountMethodologyPage(container);
    expect(container.querySelector('#ftc-corrected')).not.toBeNull();
  });

  it('has at least 15 https citation links', () => {
    const container = document.createElement('div');
    mountMethodologyPage(container);
    const links = container.querySelectorAll('a[href^="https://"]');
    expect(links.length).toBeGreaterThanOrEqual(15);
  });
});
