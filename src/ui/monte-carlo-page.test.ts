// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderMonteCarloExplanation } from './monte-carlo-page.js';
import { SimResult } from '../types.js';

describe('renderMonteCarloExplanation', () => {
  it('renders the Double-Tax Drag explanation and success rates', () => {
    const container = document.createElement('div');
    const mockRes: SimResult = {
      successRate: 0.65,
      p10: [],
      p50: [],
      p90: [],
      medianTaxUsd: 1000,
      failedTrialCount: 35,
      trialsRun: 100
    };

    renderMonteCarloExplanation(container, mockRes, mockRes, 0.9);
    expect(container.innerHTML).toContain('Double-Tax Drag');
    expect(container.innerHTML).toContain('Sequence of Returns Risk');
  });
});
