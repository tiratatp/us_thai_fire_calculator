/**
 * Tests for drawdown-page UI mounting.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { mountDrawdownPage } from './drawdown-page.js';

describe('mountDrawdownPage', () => {
  it('renders substantial HTML', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.innerHTML.length).toBeGreaterThan(3000);
  });

  it('has drawdown heading', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('h1#drawdown')).not.toBeNull();
  });

  it('lists all 7 funding sources', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    const text = container.innerHTML;
    expect(text).toContain('THB Cash');
    expect(text).toContain('USD Cash');
    expect(text).toContain('Taxable Brokerage');
    expect(text).toContain('Traditional IRA');
    expect(text).toContain('Roth IRA');
    expect(text).toContain('HSA');
  });

  it('has thai-tax-timing section', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#thai-tax-timing')).not.toBeNull();
  });

  it('explains years 4-5 USD Cash spike', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#years-4-5-spike')).not.toBeNull();
    expect(container.innerHTML).toContain('fully assessable');
  });

  it('explains years 6-16 tax-free gap', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#years-6-16-gap')).not.toBeNull();
    expect(container.innerHTML).toContain('not assessable');
  });

  it('explains years 17+ gains + RMDs', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#years-17-plus')).not.toBeNull();
    expect(container.innerHTML).toContain('RMD');
  });

  it('has key-rules section with FTC explanation', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#key-rules')).not.toBeNull();
    expect(container.innerHTML).toContain('Single-primary-taxer FTC');
  });

  it('has usd-travel section', () => {
    const container = document.createElement('div');
    mountDrawdownPage(container);
    expect(container.querySelector('#usd-travel')).not.toBeNull();
  });
});
