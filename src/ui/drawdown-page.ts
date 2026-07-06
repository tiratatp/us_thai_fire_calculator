/**
 * Mounts the Drawdown tab into a DOM container.
 *
 * Renders a static HTML explanation of the withdrawal/remittance
 * waterfall — the order in which accounts fund THB living expenses
 * and USD travel spending.
 */

export function mountDrawdownPage(container: HTMLElement): void {
  container.innerHTML = `
    <h1 id="drawdown">Withdrawal Waterfall</h1>

    <p>
      When you retire, your accounts don't all fund your lifestyle equally.
      This page explains the <strong>order</strong> the calculator uses to
      pull money out of each account — and why Thai tax appears only in
      certain years.
    </p>

    <h2 id="thb-expenses">THB Living Expenses</h2>

    <p>
      Your monthly THB cost-of-living (plus any annual THB expenses) is
      funded first from <strong>THB Cash</strong>, then remitted from
      USD accounts if THB Cash runs out. Remittances follow this priority:
    </p>

    <ol>
      <li>
        <strong>THB Cash</strong> — drawn first. Fully available and
        already in THB, so no remittance or Thai tax applies.
      </li>
      <li>
        <strong>USD Cash</strong> — if THB Cash is exhausted, USD Cash is
        converted at the current FX rate and remitted. Under post-2024
        Thai rules, this is <strong>fully assessable</strong> as Thai
        taxable income.
      </li>
      <li>
        <strong>Taxable Brokerage — basis</strong> — after USD Cash is
        spent, the original investment basis is
        remitted. Under the <em>Paw 162/2566</em> grandfathering rule,
        basis remittances are <strong>tax-free</strong> in Thailand.
      </li>
      <li>
        <strong>Taxable Brokerage — gains</strong> — once basis is
        exhausted, capital gains are remitted. Gains are subject to Thai
        tax, but you get a <strong>foreign tax credit</strong> for any
        US tax already paid on those gains.
      </li>
      <li>
        <strong>Traditional IRA / 401(k)</strong> — <abbr title="Required Minimum Distribution">RMDs</abbr> (starting at
        age 75) and voluntary withdrawals. Fully assessable in Thailand.
        US tax is first, then Thai tax with <abbr title="Foreign Tax Credit">FTC</abbr>.
      </li>
      <li>
        <strong>Roth IRA / 401(k)</strong> — not assessable in Thailand
        under current Thai law (treaty predates Roth, but Thailand does
        not currently recognize Roth tax-free status).
      </li>
      <li>
        <strong>HSA</strong> — tax-free in Thailand if used for qualified
        medical expenses. Otherwise treated as ordinary income.
      </li>
    </ol>

    <h2 id="usd-travel">USD Travel Spending</h2>

    <p>
      USD-denominated travel expenses are funded <em>after</em> THB
      living expenses. The order is:
    </p>

    <ol>
      <li>Remaining <strong>USD Cash</strong> (if any after THB funding)</li>
      <li>
        Then the same waterfall above (Taxable Brokerage → Roth →
        Traditional → HSA).
      </li>
    </ol>

    <p>
      <strong>Why USD travel often draws Roth first:</strong> Roth
      withdrawals are US-tax-free <em>and</em> not remitted to
      Thailand, so Thai tax = 0. This is Roth's "shining moment."
    </p>

    <h2 id="key-rules">Key Rules</h2>

    <ul>
      <li>
        <strong>Single-primary-taxer <abbr title="Foreign Tax Credit">FTC</abbr>:</strong> Each income item has
        exactly one primary taxer (US or Thailand). The other country
        grants a limited credit. Prevents double-crediting.
      </li>
      <li>
        <strong>Roth conversion value test:</strong> Defaults to 0 for
        Thai residents — converting to Roth costs US tax with zero Thai
        benefit.
      </li>
      <li>
        <strong><abbr title="Long-Term Capital Gains">LTCG</abbr> harvest vs Roth mutex:</strong> Both use the same
        0%–15% US bracket space. You can do one or the other, not both.
      </li>
      <li>
        <strong>No retirement-account grandfathering:</strong> Pre-2024
        grandfathering applies to Cash and Taxable Brokerage only, not
        Traditional IRA, Roth IRA, or HSA.
      </li>
    </ul>
  `;
}
