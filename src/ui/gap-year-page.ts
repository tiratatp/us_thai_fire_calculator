/**
 * Mounts the Gap-Year Strategy tab into a DOM container.
 *
 * Explains the legal 180-day non-residency window (Thai Revenue Code
 * Section 41) and how a Thai-resident retiree can spend one calendar
 * year abroad to eliminate Thai PIT on remittances for that year,
 * unlocking tax-cheap Traditional IRA withdrawals, Roth conversions,
 * and 0%-federal LTCG harvests that the calculator otherwise
 * suppresses under Systemic #2 and #3.
 *
 * Content-only page (no engine hooks). The year-by-year table shows a
 * "Consider gap year abroad" hint on rows where projected Thai tax
 * exceeds $10,000 USD; this page is where the user reads the full
 * story.
 *
 * How-to + sizing sections (Trad withdrawal, Roth conversion, LTCG
 * harvest, mutex math, age-65 cap) live in gap-year-mechanics.ts to
 * keep both files under the 250-LOC ceiling.
 */

import {
  AGE_CAP_HTML,
  TRAD_HTML,
  ROTH_HTML,
  LTCG_HTML,
  BOTH_HTML,
} from './gap-year-mechanics.js';

export function mountGapYearPage(container: HTMLElement): void {
  container.innerHTML = `
    <h1 id="gap-year">Gap-Year Strategy — Escaping Thai PIT in a Single Calendar Year</h1>

    <p>
      Thai tax residency is decided year by year by a
      <strong>180-day physical-presence test</strong> under
      <a href="https://www.rd.go.th/english/6045" target="_blank" rel="noopener">Section 41 of the Thai Revenue Code</a>.
      Spend fewer than 180 days in Thailand in a given calendar year and
      you are <strong>not a Thai tax resident</strong> that year — foreign-source
      remittances brought in during that year fall outside Thailand's taxing
      jurisdiction under Section 41 paragraph 2. This is a
      <strong>statutory result</strong>, not a loophole, and its practitioner-consensus
      reading is confirmed in the guidance issued around
      <a href="https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf" target="_blank" rel="noopener">RD Instruction Paw 161/2566</a>.
    </p>

    <h2 id="gap-year-events">Three Tax Events Unlocked</h2>

    <p>
      A gap year is most valuable when it unlocks three tax events that this
      calculator otherwise suppresses for a Thai resident:
    </p>

    <ol>
      <li>
        <strong>Large Traditional IRA / 401(k) withdrawal</strong> remitted to
        Thailand at <strong>0% Thai PIT</strong>, instead of the 20–35% top-bracket
        Thai rate that would apply during a resident year.
      </li>
      <li>
        <strong>Roth conversion</strong> sized to fill the US 12% federal
        bracket. During a resident year, the calculator's Systemic&nbsp;#2
        <em>value test</em> returns 0 — converting to Roth costs US tax with
        zero Thai benefit under the pessimistic assumption that Thailand does
        not honor the Roth wrapper on later distributions. During a gap year,
        this becomes a pure US-side win.
      </li>
      <li>
        <strong>0%-federal-LTCG harvest</strong> of Taxable Brokerage lots,
        which shares the same 12%-bracket space as Roth conversion — Systemic&nbsp;#3
        enforces mutual exclusion in any single year, but a gap year lets you
        pick one without the Thai side clawing it back.
      </li>
    </ol>

    ${TRAD_HTML}

    ${ROTH_HTML}

    ${LTCG_HTML}

    ${BOTH_HTML}

    <h2 id="gap-year-destinations">Destinations &amp; Break-Even</h2>

    <p>
      A one-year Chiang Mai retirement baseline for a comfortable single
      retiree runs roughly <strong>$21,600/yr</strong>. The gap-year destination
      must (a) permit residence for the ~330 days needed to fall below the
      Thai 180-day threshold, and (b) impose no local tax on your US-source
      remittances. Options range from clean fixed-address bases to
      continuously-moving cruise or slow-travel patterns:
    </p>

    <table class="year-table">
      <thead>
        <tr>
          <th>Destination</th>
          <th>Cost / yr</th>
          <th>Local tax on foreign income</th>
          <th>Verdict</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Philippines (SRRV)</td>
          <td>$10,800 – $18,000</td>
          <td>Exempt under NIRC §32(B)(6)</td>
          <td><strong>Good</strong></td>
        </tr>
        <tr>
          <td>Malaysia (MM2H Silver, 150k USD FD)</td>
          <td>$12,000 – $18,000</td>
          <td>Exempt under ITA §127(3)(b), 5-yr window</td>
          <td><strong>Good</strong></td>
        </tr>
        <tr>
          <td>Portugal (post-NHR closure)</td>
          <td>$22,000 – $30,000</td>
          <td>Taxed up to 48%</td>
          <td>Bad</td>
        </tr>
        <tr>
          <td>Mexico (Temporary Resident)</td>
          <td>$16,000 – $20,000</td>
          <td>Facts-and-circumstances worldwide tax</td>
          <td>Complicated</td>
        </tr>
        <tr>
          <td>USA (FL / TN, no state income tax)</td>
          <td>$30,000 – $42,000</td>
          <td>US federal always applies (no Thai saving)</td>
          <td>Complicated</td>
        </tr>
        <tr>
          <td>World cruise / continuous travel</td>
          <td>$50,000 – $100,000</td>
          <td>Usually none if no country hits its residency test</td>
          <td>Expensive but clean</td>
        </tr>
        <tr>
          <td>Multi-country slow travel (&lt;90 days each)</td>
          <td>$18,000 – $30,000</td>
          <td>None if you keep each stop truly short</td>
          <td>Cheap but risky</td>
        </tr>
      </tbody>
    </table>

    <p>
      <strong>World cruise / continuous travel</strong> keeps you outside
      Thailand for the full ~330 days without ever establishing local tax
      residency, at $50–100k/yr. Caveats: US federal tax still applies; some
      cruise lines require a fixed billing address; year-long medical coverage
      at sea is not standard travel insurance.
    </p>
    <p>
      <strong>Multi-country slow travel</strong> is cheaper but each stop must
      be truly short. Many countries have their own residency tests —
      <a href="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs16.aspx" target="_blank" rel="noopener">Portugal's 183-day rule</a>,
      <a href="https://www.agenciatributaria.es/AEAT.internet/en_gb/Inicio/_Segmentos_/Ciudadanos/Fiscalidad_de_no_residentes/Fiscalidad_de_no_residentes__ciudadanos_/Residencia_fiscal_en_Espana.shtml" target="_blank" rel="noopener">Spain's habitual-residence test</a>,
      and similar. Keep each stop &lt;90 days and avoid building a pattern
      (property, bank accounts, family) that looks like habitual residence.
    </p>

    <p>
      The calculator assumes a <strong>conservative $15,000/yr uplift</strong>
      (destination cost + travel + visa setup buffer) as the implicit cost
      that the gap-year Thai tax savings must clear. If your projected Thai
      tax for a year exceeds roughly $10,000 USD, the year-by-year table
      surfaces a "Consider gap year abroad" hint.
    </p>

    <h2 id="gap-year-threshold">Why $10,000, Not Higher</h2>

    <p>
      The hint threshold ($10,000 USD Thai tax) is set intentionally
      <em>below</em> the top-bracket break-even. In pre-RMD years the
      calculator otherwise reports zero Roth conversion and zero LTCG harvest
      (Systemic&nbsp;#2 and #3), so the direct Thai tax on the modeled
      remittance understates the real upside — the true win in those years is
      the Roth / LTCG activity the gap year <em>unlocks</em>, not just the
      Thai tax already visible in the projection.
    </p>

    ${AGE_CAP_HTML}

    <h2 id="gap-year-invariants">Invariants That Still Apply During a Gap Year</h2>

    <ul>
      <li>
        <strong>US federal tax is unchanged.</strong> Ordinary income, LTCG,
        and <abbr title="Net Investment Income Tax">NIIT</abbr> apply to
        withdrawals in the year they happen, regardless of Thai residency.
      </li>
      <li>
        <strong>US Foreign Tax Credit is zero for the gap year.</strong> There
        is no Thai tax to credit.
      </li>
      <li>
        <strong>No Paw 162/2566 grandfathering on retirement accounts.</strong>
        Traditional IRA, Roth IRA, 401(k), and HSA distributions are never
        eligible — residency status does not change this.
      </li>
      <li>
        <strong>Treaty Article 25(3) re-sourcing is moot</strong> for the gap
        year because no Thai tax is owed on the remittance.
      </li>
    </ul>

    <h2 id="gap-year-not-modeled">What the Calculator Does <em>Not</em> Model</h2>

    <p>
      This calculator does not simulate gap years automatically. Every
      projected year assumes Thai residency, which is the conservative
      (pessimistic) default. The Gap year? column in the year-by-year table
      is <strong>guidance</strong> — a flag that a particular year is a
      strong candidate for you to physically arrange a &lt;180-day stay in
      Thailand and execute the Roth / LTCG events that would otherwise be
      wasted. Treat it as a planning prompt, not a scheduled outcome.
    </p>

    <h2 id="gap-year-references">References</h2>

    <ul>
      <li>
        <a href="https://www.rd.go.th/english/6045" target="_blank" rel="noopener">Thai Revenue Code Section 41 — Residency and foreign-source income</a>
      </li>
      <li>
        <a href="https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf" target="_blank" rel="noopener">RD Instruction Paw 161/2566 — English translation (HLB Thailand)</a>
      </li>
      <li>
        <a href="https://www.bir.gov.ph/index.php/tax-code.html" target="_blank" rel="noopener">Philippines National Internal Revenue Code §32(B)(6) — Retirement benefit exclusions</a>
      </li>
      <li>
        <a href="https://pra.gov.ph/srrv/" target="_blank" rel="noopener">Philippines SRRV (Special Resident Retiree Visa) — PRA</a>
      </li>
      <li>
        <a href="https://phl.hasil.gov.my/pdf/pdfam/PR_11_2020.pdf" target="_blank" rel="noopener">Malaysia Income Tax Act §127 — Foreign-source income exemption</a>
      </li>
      <li>
        <a href="https://www.mm2h.gov.my/" target="_blank" rel="noopener">Malaysia MM2H programme — Silver tier requirements</a>
      </li>
      <li>
        <a href="https://www.irs.gov/publications/p590b" target="_blank" rel="noopener">IRS Publication 590-B — Distributions from IRAs</a>
      </li>
      <li>
        <a href="https://www.irs.gov/taxtopics/tc409" target="_blank" rel="noopener">IRS Topic No. 409 — Capital gains and the 0% LTCG bracket</a>
      </li>
    </ul>
  `;
}
