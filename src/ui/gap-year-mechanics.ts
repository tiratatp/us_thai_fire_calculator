/**
 * How-to + sizing HTML fragments for the Gap-Year Strategy tab.
 *
 * Split out of gap-year-page.ts to keep both files under the 250-LOC
 * ceiling. Each fragment is a raw HTML string consumed by
 * mountGapYearPage. Numeric constants ($49,725 top of 12%, $49,450
 * LTCG zeroTop, $16,100 std ded) mirror src/data/constants.ts
 * (US_ORDINARY_BRACKETS_2026_SINGLE, US_LTCG_BRACKETS_2026_SINGLE,
 * US_STD_DED_2026_SINGLE) — 2026 single filer.
 */

export const AGE_CAP_HTML = `
  <h3 id="gap-year-age-cap">Why the Hint Stops at Age 65</h3>
  <p>
    The year-by-year table only surfaces the gap-year hint through age
    <strong>65</strong>. Two reasons:
  </p>
  <ol>
    <li>
      <strong>Health and logistics.</strong> Relocating for ~330 days
      abroad — new insurance, new pharmacy chain, new emergency-care
      network, unfamiliar climate — gets materially harder each decade
      past 65.
    </li>
    <li>
      <strong>RMDs consume the 12% bracket anyway.</strong> Starting at
      age 73 (born ≤1950) or 75 (born ≥1951) the IRS
      <a href="https://www.irs.gov/publications/p590b" target="_blank" rel="noopener">RMD schedule (Pub 590-B)</a>
      forces Traditional IRA distributions that themselves fill or
      exceed the $49,725 top-of-12% threshold. Roth conversion and
      0%-LTCG harvest opportunities collapse; only the Trad-withdrawal
      Thai-tax savings remain, and by then a gap year is a bigger
      health bet than a tax bet.
    </li>
  </ol>
`;

export const TRAD_HTML = `
  <h3 id="gap-year-trad">Large Traditional IRA / 401(k) Withdrawal</h3>
  <p>
    <strong>How to execute.</strong> If the money is in a 401(k), roll
    it to a Traditional IRA first — 401(k) distributions carry a
    <strong>20% mandatory federal withholding</strong> that a Trad IRA
    distribution does not. The "Rule of 55" lets you withdraw penalty-free
    from a 401(k) if you separated from that employer at age 55+; from a
    Trad IRA the penalty-free age is 59½. Above 59½ there is no early-withdrawal
    penalty regardless of account type.
  </p>
  <p>
    <strong>How much.</strong> Unlike Roth conversion, there is no
    formulaic upper cap — the withdrawal <em>is</em> your spending
    funding for the gap year. The relevant question is how much of it
    lands in each US federal bracket. With <strong>zero other ordinary
    income</strong> in the gap year:
  </p>
  <ul>
    <li>First <strong>$65,825 gross</strong> ($49,725 taxable + $16,100
      standard deduction) fills the 10–12% brackets → ≈ <strong>$5,000
      federal tax</strong>.</li>
    <li>Next $56,425 pushes into the 22% bracket → +$12,414 federal
      tax.</li>
    <li>Next $96,725 pushes into the 24% bracket → +$23,214 federal
      tax.</li>
  </ul>
  <p>
    <strong>Interactions.</strong> Trad withdrawal shares the 12%
    bracket with Roth conversion — see "Can I do both together?"
    below. If an RMD is forced that year, it consumes bracket space
    <em>first</em>. Systemic #4: retirement-account remittances are
    never grandfathered by Paw 162/2566, so the Thai side of this
    withdrawal is entirely wiped by non-residency, not by pre-2024
    origin.
  </p>
`;

export const ROTH_HTML = `
  <h3 id="gap-year-roth">Roth Conversion</h3>
  <p>
    <strong>How to execute.</strong> Instruct your Traditional IRA
    custodian to perform an in-kind conversion of the desired dollar
    amount to a Roth IRA (same custodian is easiest). The converted
    amount is treated as ordinary income for that tax year.
  </p>
  <p>
    <strong>How much (formula, single filer 2026):</strong>
  </p>
  <p style="font-family:monospace; margin-left:1em;">
    roth_conversion ≤ $65,825 − other_ordinary_income
  </p>
  <p>
    where $65,825 = $49,725 (top of 12% ordinary bracket) + $16,100
    (standard deduction). This keeps the marginal rate on the last
    dollar converted at 12%.
  </p>
  <p>
    <strong>Worked example (zero other income).</strong> Convert
    $65,825 of Traditional IRA to Roth. Taxable income after the
    standard deduction: $49,725. Federal tax at 2026 single brackets:
    10% × $12,225 + 12% × ($49,725 − $12,225) ≈
    <strong>$5,723</strong>. Effective rate on the conversion:
    <strong>8.7%</strong>. During a Thai-resident year this would have
    cost the same US tax plus the Systemic #2 pessimistic Thai bite
    later — so the calculator's value test returns 0 and the
    conversion never happens. Gap year unlocks it.
  </p>
`;

export const LTCG_HTML = `
  <h3 id="gap-year-ltcg">0%-Federal LTCG Harvest</h3>
  <p>
    <strong>How to execute.</strong> Sell appreciated long-held taxable
    lots to realize gains inside the 0% LTCG bracket, then immediately
    buy them back to reset the cost basis higher. The
    <strong>wash-sale rule does not apply to gains</strong> — only to
    losses — so an instant repurchase is legal for this purpose. Keep
    the total capital gain plus other ordinary taxable income under
    the 0% LTCG ceiling.
  </p>
  <p>
    <strong>How much (formula, single filer 2026):</strong>
  </p>
  <p style="font-family:monospace; margin-left:1em;">
    ltcg_room ≤ $49,450 − (other_ordinary_income + roth_conversion − $16,100)
  </p>
  <p>
    where $49,450 is the top of the 0% LTCG bracket (note: this is
    <em>lower</em> than the $49,725 top of the 12% ordinary bracket —
    close but not identical). With zero other income and no Roth
    conversion, you can harvest up to <strong>$49,450 + $16,100 =
    $65,550 gross</strong> and pay <strong>$0 federal LTCG</strong>.
  </p>
`;

export const BOTH_HTML = `
  <h3 id="gap-year-both">Can I Do Both in the Same Year?</h3>
  <p>
    <strong>No — they compete for the same bracket space.</strong>
    LTCG stacks on top of ordinary taxable income for bracket
    determination. If you fill the 12% ordinary bracket with a $49,725
    Roth conversion (taxable), your taxable ordinary income is
    $49,725 — already <strong>above</strong> the $49,450 LTCG 0%
    ceiling. Every dollar of LTCG then falls into the 15% bracket, so
    the LTCG harvest costs 15% of the gain rather than 0%. Systemic #3
    enforces this mutex: in any single year, pick one — the larger
    win.
  </p>
  <p>
    <strong>Rule of thumb.</strong> Roth conversion is more valuable
    when your Traditional balance is large and your remaining life
    expectancy is long enough to compound the Roth's tax-free growth.
    0%-LTCG harvest is more valuable when you have a large embedded
    gain in a Taxable Brokerage lot you plan to spend soon. In a
    single gap year, pick the bigger of the two; in a second future
    gap year (if the age-65 cap allows), do the other.
  </p>
`;
