import { SimResult } from '../types.js';
import { CORRELATION_MATRIX } from '../methodology/content.js';
import { escapeHtml } from '../methodology/render.js';

function renderCorrelationMatrix(): string {
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

export function renderMonteCarloExplanation(container: HTMLElement, optimistic: SimResult, pessimistic: SimResult, successThreshold: number): void {
  const corrHtml = renderCorrelationMatrix();
  container.innerHTML = `
    <h2>Monte Carlo Simulation</h2>
    <p class="mb-4">
      The standard FIRE Target multiplier (33×) provides a baseline, but cross-border retirements face compounded risks. Our Monte Carlo simulation runs thousands of stochastic market scenarios testing your portfolio against the "Triple Threat":
    </p>
    <ul class="mb-4 ml-6 list-disc">
      <li><strong>Sequence of Returns Risk:</strong> Experiencing bear markets early in retirement permanently impairs the portfolio's compounding base.</li>
      <li><strong>FX Volatility:</strong> A strong Thai Baht or weak US Dollar forces you to liquidate significantly more USD assets just to cover fixed THB living expenses.</li>
      <li><strong>Double-Tax Drag:</strong> Liquidating assets incurs US taxes (Capital Gains or Ordinary Income), and remitting those funds to Thailand incurs progressive Thai Personal Income Tax. This acts as a multiplier on your withdrawals—you may need to withdraw $1.30 just to net $1.00 of spendable cash.</li>
    </ul>
    <p class="mb-6">
      <strong>Because of these compounded frictions, it is very common to exceed the 33× FIRE Target yet still see a simulation success rate below 50%.</strong>
    </p>

    <h3>Monte Carlo Default Assumptions</h3>
    <p>
      Monte Carlo simulation of portfolio outcomes uses forward-looking capital market assumptions rather than pure historical bootstrapping, following the approach used by Vanguard's Capital Markets Model (VCMM) and similar institutional forecasts. Default annualized parameters are: US Equities 6.0% mean / 17.0% volatility, International Developed Equities 6.0% / 19.0%, US Aggregate Bonds 4.0% / 7.0%, Cash 3.5% / 1.0%. US CPI inflation defaults to a 3.0% mean with 1.4% standard deviation; Thai CPI inflation defaults to 2.0% / 2.5%. The USD/THB exchange rate follows a geometric random walk centered at 35 THB/USD with 8% annual log-volatility.
    </p>
    <p class="mb-6">
      The default trial count is 1,000, adjustable upward to 10,000. A trial "succeeds" when the portfolio remains positive through the specified life expectancy AND every year's desired real spending was fully funded from portfolio and non-portfolio income. The reported success rate is the fraction of trials meeting both conditions.
    </p>
    <div class="citations mb-4">
      <a href="https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html" target="_blank" rel="noopener">Vanguard Capital Markets Model — Return Forecasts</a> · 
      <a href="https://fred.stlouisfed.org/data/AEXTHUS" target="_blank" rel="noopener">Federal Reserve Economic Data — USD/THB Exchange Rate</a> · 
      <a href="https://fred.stlouisfed.org/data/FPCPITOTLZGTHA" target="_blank" rel="noopener">Federal Reserve Economic Data — Thai CPI Inflation</a>
    </div>

    <h3>Correlation Matrix</h3>
    <p class="mb-4">
      Correlated multi-asset returns are drawn using Cholesky decomposition of a 4×4 correlation matrix over the asset ordering (US Stock, US Bond, International Stock, Cash). The default correlations approximate long-run historical values as reported by Portfolio Visualizer and consistent with the cFIREsim methodology: a mild negative US-stock/US-bond correlation, a strong positive US-stock/international-stock correlation, and near-zero correlations between cash and the risky assets.
    </p>
    ${corrHtml}
    <div class="citations mb-6 mt-4">
      <a href="https://www.portfoliovisualizer.com/monte-carlo-simulation" target="_blank" rel="noopener">Portfolio Visualizer — Monte Carlo Simulation</a>
    </div>

    <h3>PRNG: Mulberry32 Seeded Random Number Generator</h3>
    <p class="mb-4">
      Random draws are produced by the Mulberry32 pseudorandom number generator, a 32-bit generator that passes the gjrand statistical test suite. Mulberry32 takes an integer seed and produces a deterministic sequence — identical seeds produce byte-identical return paths, so results are fully reproducible. Uniform draws are converted to standard normal variates via the Box-Muller transform, and correlated multi-asset draws are obtained by matrix-multiplying the independent normal vector by the lower-triangular Cholesky factor of the correlation matrix.
    </p>
    <div class="citations mb-6">
      <a href="https://gist.github.com/tommyettinger/46a874533244883189143505d203312c" target="_blank" rel="noopener">Mulberry32 — Tommy Ettinger (public-domain gist, gjrand-tested)</a>
    </div>
  `;
}
