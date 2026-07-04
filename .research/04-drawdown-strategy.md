# Optimal Withdrawal Ordering for US Retirees — Algorithmic Reference

## 1. Classic Conventional Ordering

Rule: **Cash → Taxable Brokerage → Traditional 401(k)/IRA → Roth 401(k)/IRA**

Rationale (Bogleheads Wiki):
- Taxable first: LTCG rates (0/15/20%) often lower than ordinary income; tax-loss harvesting available
- Tax-deferred next: preserves sheltered compounding
- Roth last: tax-free growth continues; passes to heirs income-tax-free

Kitces (2016): "The textbook rule is correct for ~10-20% of household-years; for the majority, some other constraint binds."

**Source:** https://www.bogleheads.org/wiki/Retirement_draw-down_priority ; https://www.kitces.com/blog/tax-efficient-retirement-withdrawal-strategies-to-fund-retirement-spending-needs/

## 2. Bracket-Aware Ordering (Optimal)

Per year:
1. If 0% LTCG bracket has room and appreciated lots exist → sell those lots first
2. Fill 12% ordinary bracket from Traditional (effectively free Roth conversion)
3. Above 12%, switch to taxable basis (return of basis = tax-free)
4. Fill Traditional up to IRMAA / ACA / NIIT constraint
5. Above constraints, source from Roth (no AGI impact)

Kitces: "The optimal approach is to preserve tax-preferenced retirement accounts and fill tax brackets early on, funding retirement spending from taxable investment accounts but doing systematic partial Roth conversions of the pre-tax IRA to fill tax brackets in the early years."

Overriding constraints:
- RMDs at 73/75 (mandatory)
- IRMAA cliffs (~40%+ effective marginal)
- ACA cliff at 400% FPL — NOT RELEVANT for our Thailand-resident user
- NIIT 3.8% above thresholds
- LTCG stacking (ordinary income pushes LTCG into 15% bracket)

## 3. Roth Conversion Ladder

Conversion size targets (Kitces):
- Fill 12% bracket for most early retirees
- 22% bracket is practical ceiling
- 24% only if converting is essential

2026 caps (no other income):
- Single: $15,750 std deduction + $49,450 12% top ≈ $65,200 conversion room
- MFJ: $32,200 + $98,900 ≈ $131,100 conversion room

Cliffs to watch:
- IRMAA (US Medicare) — user is in Thailand, likely on Thai healthcare so IRMAA impact depends on Medicare enrollment
- LTCG stacking

RMD interaction:
- Born 1951-1959: RMDs at 73
- Born 1960+: RMDs at 75 (SECURE 2.0)
- Aggressive conversion during retirement → RMD age reduces future RMDs

Per-conversion 5-year clock:
- Starts Jan 1 of conversion year
- After 5 years, converted principal accessible without penalty (regardless of age)
- Age 59.5+ makes 5-year clock irrelevant for penalty

**Source:** https://www.kitces.com/blog/roth-conversion-analysis-value-calculate-timing-true-marginal-tax-rate-equivalency-principle/ ; https://bridgetoretired.com/blog/roth-ladder-vs-72t

## 4. Age Milestones

| Age | Change |
|-----|--------|
| <59.5 | 10% penalty on Traditional IRA/401k; use Rule of 55 / 72(t) / Roth contributions / taxable as bridge |
| 59.5 | Penalty ends; Roth ladder 5-yr clock becomes moot |
| 65 | HSA non-medical becomes penalty-free (still ordinary income); Medicare eligible |
| 70.5 | QCDs available from IRA (counts toward RMD, not AGI) |
| 73 or 75 | RMDs mandatory |

## 5. HSA Strategy

Fidelity: "Treat the HSA as a retirement savings vehicle. Pay current medical expenses from taxable/cash. Don't tap HSA unless necessary."

Bogleheads: "Save all receipts — no time limit on reimbursement."

Optimal sequence:
1. Pay current medical out-of-pocket from taxable during accumulation
2. Max HSA contributions during working years
3. Invest HSA in index funds
4. Save receipts
5. Pre-65: use HSA tax-free for qualified medical when needed
6. Post-65: use for Medicare premiums (tax-free), then reimburse old receipts (tax-free), then non-medical (ordinary income only, no penalty)

**In Thailand retirement:** Thai healthcare expenses are NOT US-qualified medical. HSA loses its tax-free medical superpower for daily Thai spending. Post-65 HSA effectively becomes a Traditional IRA. **Draw HSA last** unless user maintains Medicare and pays US medical from HSA.

**Source:** https://www.fidelity.com/viewpoints/wealth-management/hsas-and-your-retirement ; https://corporate.vanguard.com/content/dam/corp/research/pdf/stretch_your_financial_muscles_unique_flexibility_of_hsas.pdf

## 6. Pre-59.5 Bridge Strategies

Rule of 55:
- 401k only, most recent employer, separation at 55+
- Doesn't apply to rolled IRAs
- 457(b) governmental: any age after separation

72(t) SEPP:
- Three methods (RMD lowest, Fixed Amortization, Fixed Annuitization)
- Locked ≥5 years OR to 59.5, whichever longer
- Modification triggers retroactive 10% + interest on all prior payments
- SECURE 2.0: one-time switch from fixed → RMD method allowed

Roth contribution withdrawal:
- Contributions (not earnings, not conversions) — anytime tax/penalty-free
- Limited to contribution basis

Taxable brokerage:
- Primary bridge; use tax-loss harvesting
- Draw 0% LTCG lots first

**Source:** https://www.kitces.com/blog/rule-72t-sepp-calculate-payments-rmd-avoid-penalty-tax-early-ira-withdrawals-notice-2022-6/

## 7. Decision Algorithm (Pseudocode)

```
PER YEAR (age, balances, spending_need, other_income):

# Step 0: Constraints
RMD_floor = (age >= RMD_age) ? calc_RMD(traditional_total) : 0
IRMAA_cap = compute_IRMAA_threshold(MAGI)  # only if on Medicare

# Step 1: Mandatory RMD
withdraw(traditional, RMD_floor)
remaining_need = spending_need - RMD_floor

# Step 2: Roth conversion (age < RMD_age, low bracket year)
if age < RMD_age:
  conv_budget = min(
    IRMAA_cap - other_income - RMD_floor,
    bracket_12_top - other_income - std_deduction,
  )
  if conv_budget > 0:
    convert(traditional, conv_budget)
    pay_tax_from(cash_or_taxable, conv_budget * effective_rate)

# Step 3: Bracket-aware sourcing for remaining_need
# 3a: 0% LTCG bracket lots
if taxable_appreciated > 0 and taxable_income < LTCG_0_threshold:
  draw_from_taxable(min(remaining_need, LTCG_0_room))
# 3b: Return of basis
if remaining_need > 0:
  draw_from_taxable(min(remaining_need, remaining_basis))
# 3c: Roth for excess if AGI-sensitive (IRMAA)
if remaining_need > 0 and near_irmaa_cliff:
  draw_from_roth(min(remaining_need, roth_balance))
# 3d: Taxable gains above 0% bracket
if remaining_need > 0:
  draw_from_taxable(remaining_need)

# Step 4: HSA for QUALIFIED MEDICAL only
if qualified_medical > 0:
  draw_hsa(min(qualified_medical, hsa_balance))  # tax-free

# Step 5: Traditional as last resort
if remaining_need > 0 and age >= 59.5:
  draw_from_traditional(remaining_need)
elif remaining_need > 0 and age < 59.5:
  # Use exception path (Rule of 55 / 72(t) / Roth basis)
  ...

# Step 6: QCDs (age 70.5+, charitable)
if age >= 70.5 and charitable > 0:
  qcd = min(charitable, ira_balance, 105000)
  direct_qcd_from_ira(qcd)
```

## 8. Thai Overlay (from our other research)

For a Thai-resident US citizen, the above changes:

1. **US ACA subsidies IRRELEVANT** (not on ACA in Thailand). Remove ACA cliff constraint.
2. **IRMAA relevant only if enrolled in Medicare Part B/D** (many Thai retirees don't enroll if under 65 and not returning to US often).
3. **Thai tax on remittance** adds a NEW dimension: minimize remittances by using Thai-side accounts first.
4. **Roth NO LONGER a safety valve in Thailand** (Thailand may tax remitted Roth as pension income). Prefer to leave Roth in US, use it for US-side needs (travel, US medical while on Medicare, gifts to US family).
5. **Roth conversion** is a US-tax-only event (no remittance). Do aggressive conversions during low-income US years — free of Thai tax since no cross-border remittance.
6. **Grandfathering (Paw 162/2566):** entered starting balances are pre-2024 principal → Thai-exempt when remitted. Post-2024 gains on those balances ARE Thai-taxable on remittance.

**Modified Thai-aware order for the calculator (v1):**

For each year, minimize combined US + Thai tax:

```
Per year (Thai-resident retiree):
  1. Compute annual spending need in THB (Thai expenses) and USD (US travel)
  2. Satisfy THB need from THB-denominated accounts FIRST (Thai cash, Thai brokerage)
     - Thai listed stocks: no CGT for individuals
     - Thai cash interest: already withheld, no additional PIT if withheld
  3. Satisfy USD travel need from USD accounts (US cash, US taxable)
  4. If THB need still exists, remit from US:
     Order (min combined tax):
       a. US cash / return of basis (0 US tax; Thailand: exempt if pre-2024 basis under Paw 162)
       b. US taxable basis-heavy lots (US: 0% LTCG for the qualified portion; Thailand: gain only assessable)
       c. Traditional IRA/401k (US ordinary + Thai PIT, FTC reduces double tax)
       d. Roth (US: tax-free; Thailand: likely taxable — worst-case treat as pension)
       e. HSA non-med post-65 (US ordinary + Thai PIT, FTC)
  5. Roth conversion during US low-income years (US tax only, no remittance)
  6. Apply RMD floor at age 73/75 (mandatory)
  7. Compute US federal tax (with FTC for Thai tax on remitted-to-Thai income)
  8. Compute Thai PIT (with FTC for US tax on US-source income under Art. 25)
```

Design note: Since Thailand's FTC is on US-source income (Art. 25(2)) and US saving clause makes US tax on citizens irreducible, in practice **Thailand often ends up as the marginal payer** — Thai tax > US tax on remitted income, so Thai grants full US credit but US grants only partial Thai credit. The user pays approximately the HIGHER of the two effective rates on remitted income.

## References

- Kitces: https://www.kitces.com/blog/tax-efficient-retirement-withdrawal-strategies-to-fund-retirement-spending-needs/
- Kitces Roth: https://www.kitces.com/blog/roth-conversion-analysis-value-calculate-timing-true-marginal-tax-rate-equivalency-principle/
- Kitces 72(t): https://www.kitces.com/blog/rule-72t-sepp-calculate-payments-rmd-avoid-penalty-tax-early-ira-withdrawals-notice-2022-6/
- Bogleheads: https://www.bogleheads.org/wiki/Retirement_draw-down_priority
- Fidelity withdrawals: https://www.fidelity.com/viewpoints/retirement/tax-savvy-withdrawals
- Fidelity HSA: https://www.fidelity.com/viewpoints/wealth-management/hsas-and-your-retirement
- Vanguard HSA: https://corporate.vanguard.com/content/dam/corp/research/pdf/stretch_your_financial_muscles_unique_flexibility_of_hsas.pdf
