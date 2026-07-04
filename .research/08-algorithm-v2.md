# Corrected Drawdown Algorithm v2 (post-Oracle)

Locked design after Oracle's adversarial review and user's v1 scope decision.

## Objective (locked)

**Primary:** Maximize P(spending met for life) via Monte Carlo. FIRE ⇔ success ≥ threshold (default 90%, user-adjustable).

Secondary metrics displayed:
- Percentile ending wealth (10th, 50th, 90th)
- Median lifetime tax paid
- Median regulatory-uncertainty delta (optimistic vs pessimistic)

## Scope (locked — MVP for v1)

**IN v1:**
- Single-filer only (no MFJ/MFS)
- 2 currencies (USD, THB) × 7 account types (Cash, Taxable Brokerage, Traditional 401k, Roth 401k, Traditional IRA, Roth IRA, HSA)
- Per-year Thai-resident toggle
- Corrected FTC / sourcing engine
- Regulatory scenario bands (optimistic vs pessimistic)
- Monte Carlo with correlated returns + FX + inflation
- Year-by-year table with tax breakdown
- Methodology page with citations
- No grandfathering for retirement accounts; optional Jan-1-2024 snapshot input for cash + taxable brokerage only
- RMD table + rules (age 73/75 per SECURE 2.0)
- Basic penalty rules pre-59.5 (10% flat, no 72(t)/Rule-of-55 modeling)
- HSA: qualified medical (US) tax-free withdrawal; non-medical pre-65 = 20% penalty; post-65 non-medical = ordinary income

**OUT v1 (v2 backlog):**
- Filing status other than single (MFJ, MFS)
- 72(t) SEPP explicit modeling
- Rule of 55 explicit modeling
- Pro-rata Traditional IRA basis (Form 8606)
- Specific-lot / HIFO tracking
- Per-plan 401(k) RMD separation
- US state tax
- FEIE / earned income
- SBLOC modeling
- QCDs
- Multi-year DP optimization

## Algorithm (v2, corrected)

### Data model

```
Account:
  id: string
  type: Cash | TaxableBrokerage | Traditional401k | Roth401k | TraditionalIRA | RothIRA | HSA
  currency: USD | THB
  balance: number  # in native currency
  basis?: number   # for taxable brokerage (optional grandfather snapshot for pre-2024 basis)
  pre2024Balance?: number  # optional Jan-1-2024 snapshot (Cash & Taxable only)

Assumption (user-editable, with defaults):
  # Return distributions (nominal annual)
  usStock: {mean: 0.06, sd: 0.17}       # Vanguard VCMM forward
  usBond:  {mean: 0.04, sd: 0.07}
  intlStock: {mean: 0.06, sd: 0.19}
  cash:    {mean: 0.035, sd: 0.01}
  usInflation:   {mean: 0.03, sd: 0.014}
  thaiInflation: {mean: 0.020, sd: 0.025}
  fxUsdThb: {mean: 35, sdAnnualLog: 0.08, meanReversion: 0}  # random walk
  # Correlations (S=US stock, B=US bond, I=Intl, C=Cash)
  corr: 4x4 matrix from research
  # Portfolio composition
  stockAllocationTaxable: 0.60
  stockAllocationTaxDeferred: 0.60
  # ... per account type

RegulatoryScenario:
  rothTaxedByThailand: boolean  # optimistic=false, pessimistic=true
  treatyResourcesUsSourcePensions: boolean  # optimistic=true, pessimistic=false
  thaiPensionDeductionApplies: boolean  # optimistic=true, pessimistic=false
  niitCreditableAgainstThai: boolean  # optimistic=true, pessimistic=false
  # (retirement account grandfathering already locked to false)

UserInputs:
  currentAge: number
  lifeExpectancy: number
  accounts: Account[]
  expenses: {
    housingThbMo, foodThbMo, transportThbMo, otherThbMo,
    healthcareThbYr, legalTaxThbYr, travelUsdYr
  }
  thaiResidencyByYear: boolean[]  # length = lifeExpectancy - currentAge; default all true
  successThreshold: number  # default 0.90
  regulatoryStance: 'optimistic' | 'pessimistic' | 'both'  # 'both' shows band
  monteCarloTrials: number  # default 1000
```

### Per-year decision procedure (corrected)

```
FUNCTION year_step(state, year_idx):
  age = state.currentAge + year_idx
  isThaiResident = state.thaiResidencyByYear[year_idx]

  # ---- Step 0: Compute needs (inflated) ----
  thbNeed = sum(thb_expenses) * (1 + thaiInflation)^year_idx
  usdNeed = sum(usd_expenses) * (1 + usInflation)^year_idx

  # ---- Step 1: MANDATORY RMD (age >= RMD_age) ----
  rmd_age = birthYear >= 1960 ? 75 : 73
  rmdAmount = 0
  IF age >= rmd_age:
    FOR each Traditional IRA / Traditional 401k account (US):
      divisor = UniformLifetimeTable[age]
      prior_year_end_balance = state.accounts[i].priorYearEndBalance
      rmd_i = prior_year_end_balance / divisor
      rmdAmount += rmd_i
      withdraw(account_i, rmd_i)  # into USD cash bucket
      state.usOrdinaryIncome += rmd_i

  # ---- Step 2: Fund THB need ----
  # 2a: Thai-side accounts first (no US tax; Thai treatment depends on account)
  remainingThbNeed = thbNeed
  drawFrom_ThaiAccounts(remainingThbNeed)  # Thai cash, Thai brokerage (SET-listed exempt CGT)

  # 2b: Remit from US if remainingThbNeed > 0
  IF remainingThbNeed > 0:
    #   Ordered list of remittance sources (Thai-resident view):
    #   Order: min combined tax burden AFTER corrected FTC
    #   Corrected: exactly ONE primary taxer per income item
    #
    #   Preference order:
    #     1. USD cash from RMD proceeds (already US-taxed; if remitted this year, Thai taxes as pension)
    #     2. US Taxable brokerage:
    #        - Return of basis: US=0, Thai=0 (basis is not income)
    #        - Gain in 0% LTCG bracket: US=0, Thai=tax on gain only
    #        - Gain in 15% LTCG bracket: US=15% × gain, Thai=tax on gain, US grants FTC
    #     3. USD cash from Traditional IRA distribution:
    #        - US ordinary + Thai pension income (both apply)
    #        - Treaty re-sourcing (per regulatory scenario) determines primary taxer
    #        - Pay higher-of if resourced; DOUBLE if not resourced
    #     4. Roth (worst use in Thailand):
    #        - US=0; Thai=pension (per regulatory scenario)
    #        - No FTC available because US=0

    remitPlan = solveRemittance(remainingThbNeed, availableSources, regulatoryScenario)

  # ---- Step 3: Fund USD need (travel) ----
  remainingUsdNeed = usdNeed
  # 3a: Draw from USD cash first (no tax event)
  # 3b: Then US taxable brokerage using 0% LTCG bracket lots (US=0, Thai=0 because not remitted)
  # 3c: Then Roth (US=0, Thai=0 because not remitted) — this is where Roth SHINES
  # 3d: Then Traditional IRA (US ordinary, Thai=0 since not remitted)
  drawUsdSources(remainingUsdNeed)

  # ---- Step 4: Roth conversion (ONLY if value test clears) ----
  # NOT a default "fill 12%". Only convert if:
  #   (a) age < RMD_age
  #   (b) Traditional US balance > 0
  #   (c) 0% LTCG bracket is NOT being used for taxable harvest this year (mutex per Systemic #3)
  #   (d) forecasted future US marginal rate on RMDs > current US marginal + Thai marginal on eventual remittance
  # For a Thai-resident user, this usually returns 0.
  conversionAmount = valueTestRothConversion(state, regulatoryScenario)
  IF conversionAmount > 0:
    convert(TraditionalUsIra, conversionAmount)  # to Roth IRA
    state.usOrdinaryIncome += conversionAmount
    # No Thai tax (no remittance)
    # Track Roth 5-yr clock for this conversion (only relevant pre-59.5)

  # ---- Step 5: Compute US federal tax ----
  usOrdinary = state.usOrdinaryIncome  # RMD + Traditional withdrawals + conversion + HSA non-med
  usLtcg = realizedLtcg
  usTaxable = max(0, usOrdinary - STD_DED_2026[single])
  usTax = ordinaryBracketTax(usTaxable) + ltcgStackTax(usTaxable, usLtcg)
  # NIIT
  magi = usOrdinary + usLtcg + otherInvIncome
  IF magi > 200000:
    niit = 0.038 * min(netInvIncome, magi - 200000)
    usTax += niit

  # ---- Step 6: Compute Thai PIT (only if isThaiResident) ----
  IF isThaiResident:
    thaiAssessable = 0
    FOR each remittance item:
      # Determine assessable amount by source type
      # For retirement accounts (Traditional/Roth): full remittance is assessable pension
      # For taxable brokerage: gain portion only (basis is capital, not income)
      # For cash: pre-2024 snapshot subtracted first (grandfathered); rest is assessable
      thaiAssessable += remitItem.assessablePortion
    # Deductions
    thaiAssessable -= THAI_PERSONAL_ALLOWANCE  # 60,000 THB
    IF regScenario.thaiPensionDeductionApplies AND hasPensionRemittance:
      thaiAssessable -= min(100000, 0.5 * pensionRemittance)  # 50% capped at 100k
    thaiTax = thaiProgressivePit(max(0, thaiAssessable))
  ELSE:
    thaiTax = 0  # not resident this year → no Thai tax on foreign remittance

  # ---- Step 7: Apply FTC (CORRECTED — one primary taxer per item) ----
  # For each remitted income item, determine primary taxer per treaty:
  #   Retirement accounts (Traditional/Roth): Thailand primary (Art. 20(1))
  #     - IF regScenario.treatyResourcesUsSourcePensions:
  #         US treats income as foreign-source; US grants FTC = min(usTaxOnItem, thaiTaxOnItem)
  #     - ELSE: no re-sourcing → both taxes stand → double tax
  #   Capital gains from remitted taxable brokerage: Thailand primary (Art. 13)
  #     US grants FTC = min(usLtcgOnItem, thaiTaxOnItem)
  #   Cash remittance: whichever is primary based on origin
  #
  # Aggregate FTC applied to US tax; Thai side does NOT credit back (already primary)
  ftc = computeFtc(remittanceItems, regScenario)
  usTaxNet = max(0, usTax - ftc)

  # ---- Step 8: Pay taxes and update state ----
  totalTaxUsd = usTaxNet + thaiTax / fxRate
  # Tax must be paid from USD cash (US tax) and THB cash (Thai tax)
  # If insufficient cash, may force additional withdrawal → recurse or clamp
  payTaxes(usTaxNet, thaiTax)
  updateRothClocks()
  updateBasisTracking()

  # ---- Step 9: Grow remaining balances (stochastic returns) ----
  applyReturnsToBalances(returns[year_idx])

  # ---- Step 10: Portfolio failure check ----
  IF anyNegativeBalance OR spendingUnmet:
    state.failed = true
    state.failureYear = year_idx
    return

RETURN state
```

### Monte Carlo wrapper

```
FUNCTION runMonteCarlo(userInputs, assumptions, regulatoryScenario, seed):
  rng = mulberry32(seed)
  L = choleskyDecompose(assumptions.corr)
  trials = 1000  # user-adjustable
  survivalCount = 0
  yearlyPercentiles = []  # for chart bands

  FOR trial IN 1..trials:
    state = clone(userInputs)
    yearlyOutcomes = []
    FOR year IN 1..lifeExpectancy - currentAge:
      returns = drawCorrelatedNormals(rng, L, assumptions)  # 4-vector
      fxShock = drawLogNormal(rng, assumptions.fxUsdThb.sdAnnualLog)
      state.fxRate *= exp(fxShock)
      state.inflations = drawInflations(rng, assumptions)
      state = year_step(state, year, returns)
      yearlyOutcomes.push(state.snapshot())
      IF state.failed:
        break

    IF NOT state.failed:
      survivalCount++
    yearlyPercentiles.record(yearlyOutcomes)

  RETURN {
    successRate: survivalCount / trials,
    p10: yearlyPercentiles.percentile(10),
    p50: yearlyPercentiles.percentile(50),
    p90: yearlyPercentiles.percentile(90),
    medianTax: computeMedianTax(yearlyPercentiles),
  }
```

### Regulatory bands

Run the MC TWICE (or a small combinatorial set):
- `runMonteCarlo(..., {rothTaxedByThailand:false, treatyResources:true, pensionDed:true, niitCredit:true})` → **OPTIMISTIC**
- `runMonteCarlo(..., {rothTaxedByThailand:true, treatyResources:false, pensionDed:false, niitCredit:false})` → **PESSIMISTIC**

Display both. The delta = user's regulatory exposure.

### Corrected FTC computation (worked example, D3)

$50k Traditional IRA remitted at FX=35:

```
Item: US-source pension distribution
Primary (per Art. 20(1)): Thailand (residence)

Thai tax on 1,750,000 THB pension:
  Assessable = 1,750,000 - 100,000 (if pension ded) - 60,000 = 1,590,000
  Thai PIT (2026 brackets) = 262,500 THB ≈ $7,500

US tax on $50,000 ordinary:
  Taxable = 50,000 - 15,750 = 34,250
  US tax ≈ $3,850

IF regScenario.treatyResourcesUsSourcePensions:
  # US treats as foreign-source → FTC limited to US tax on that item
  ftc = min($3,850, $7,500) = $3,850
  US net = $3,850 - $3,850 = $0
  Total = $7,500 Thai only ≈ 15%
ELSE:
  # No re-sourcing → both taxes stand
  Total = $3,850 + $7,500 = $11,350 ≈ 22.7%
```

Display both numbers in the Year-by-Year table when `regulatoryStance = both`.

### 0% LTCG vs Roth conversion (mutex per Systemic #3)

In any given year, the algorithm computes:
- **Option A:** Harvest 0% LTCG (fill 12% bracket top - other_income with realized gains) → 0% US LTCG tax
- **Option B:** Roth convert to fill 12% bracket top - other_income → 12% US ordinary tax on conversion

Option A dominates for Thai residents in almost all cases (basis-heavy lots → free gain realization; converts a Thai-taxable Traditional balance INTO a Thai-taxable Roth balance for no benefit, versus creating Thai-exempt basis).

Algorithm chooses A over B by default. Only picks B if:
- taxable_appreciated_basis_lots < conversion_room_available (i.e., not enough gain to fill 0% bracket)
- future US RMD tax is provably reduced by conversion (rarely true at typical FIRE balances)

## Constants module (values → citations)

Define in `src/data/constants.ts` with citations attached:

```typescript
export const US_STD_DED_2026 = {
  single: 15750,
  mfj: 32200,
  hoh: 24150,
  // source: https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
}

export const US_ORDINARY_BRACKETS_2026_SINGLE = [
  { top: 12225, rate: 0.10 },
  { top: 49725, rate: 0.12 },
  { top: 106150, rate: 0.22 },
  { top: 202875, rate: 0.24 },
  { top: 257475, rate: 0.32 },
  { top: 644675, rate: 0.35 },
  { top: Infinity, rate: 0.37 },
  // source: irs.gov 2026 inflation adjustments
]

// ... similar for LTCG brackets, Thai PIT brackets, RMD divisors, allowances
```

Methodology page renders directly from this file. Single source of truth.
