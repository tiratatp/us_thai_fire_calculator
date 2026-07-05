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
        spent, the original investment basis ($900k of $1.275M) is
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
        <strong>Traditional IRA / 401(k)</strong> — RMDs (starting at
        age 75) and voluntary withdrawals. Fully assessable in Thailand.
        US tax is first, then Thai tax with FTC.
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

    <h2 id="thai-tax-timing">Why Thai Tax Appears Only in Certain Years</h2>

    <p>
      With default inputs (THB Cash = 9.5M THB, USD Cash = $165k,
      Taxable Brokerage = $1.275M with $900k basis), Thai tax follows
      a distinctive pattern:
    </p>

    <h3 id="years-4-5-spike">Years 4–5: The USD Cash Spike</h3>

    <p>
      THB Cash lasts ~3 years. When it runs out, remittations from USD
      Cash begin. Under post-2024 Thai rules, USD Cash remittances are
      <strong>fully assessable</strong> (no grandfathering applies),
      triggering Thai personal income tax on amounts above the 150k THB
      deduction. This creates a sharp tax spike in years 4–5.
    </p>

    <h3 id="years-6-16-gap">Years 6–16: The Tax-Free Gap</h3>

    <p>
      Once USD Cash is spent, the calculator remits <strong>Taxable
      Brokerage basis</strong> ($900k) before touching gains. Under
      <em>Paw 162/2566</em>, basis remittances are <strong>not
      assessable</strong> in Thailand — so Thai tax drops to near zero.
      This gap lasts ~10 years while the $900k basis is drawn down.
    </p>

    <h3 id="years-17-plus">Year 17+: Gains + RMDs</h3>

    <p>
      After basis is exhausted, <strong>capital gains</strong> are
      remitted and taxed in Thailand (with FTC offset). Simultaneously,
      <strong>Traditional IRA RMDs</strong> begin at age 75. Both are
      fully assessable in Thailand, creating sustained Thai tax liability
      offset by foreign tax credits on US-paid tax.
    </p>

    <h2 id="key-rules">Key Rules</h2>

    <ul>
      <li>
        <strong>Single-primary-taxer FTC:</strong> Each income item has
        exactly one primary taxer (US or Thailand). The other country
        grants a limited credit. Prevents double-crediting.
      </li>
      <li>
        <strong>Roth conversion value test:</strong> Defaults to 0 for
        Thai residents — converting to Roth costs US tax with zero Thai
        benefit.
      </li>
      <li>
        <strong>LTCG harvest vs Roth mutex:</strong> Both use the same
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
