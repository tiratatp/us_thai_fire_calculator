# Oracle Adversarial Review — v1 Drawdown Algorithm

Oracle's verdict: **NOT SAFE TO IMPLEMENT AS SPECIFIED.** Four systemic bugs, two conceptual errors, several missing levers.

## Four Systemic Bugs (must fix before any code)

### Systemic #1 — Double-FTC bug (WRONG DIRECTION)
Algorithm credits Thai tax against US **AND** US tax against Thai on the same income. That double-counts relief and understates liability. Correct model: **one primary taxer per income item; the other grants a limited credit.**

For US-source pensions (IRA/401k/Roth distributions):
- Thailand (residence) is **primary** under Article 20(1)
- US **credits** Thai tax **only if treaty re-sourcing** converts US-source pension to foreign-source for §904 purposes
- If re-sourcing fails: **genuine double taxation** (~22.7% in D3 example)
- If re-sourcing succeeds: pay the **higher** of the two rates (~15% Thai in D3 example)

**FIX:** rebuild engine around per-income sourcing + explicit re-sourcing scenario flag.

### Systemic #2 — Roth ladder premise collapses for Thai residents
"Fill the 12% bracket" is US-centric logic. For a Thai resident:
- Thailand taxes remitted Roth as pension **regardless** of US tax-free status → **zero Thai benefit**
- Conversion is a **pure US out-of-pocket cost** in any year nothing is remitted (no Thai FTC to absorb it)
- At typical FIRE balances future RMDs are trivial → little RMD tax to avoid

**Expected honest answer: few or zero conversions.** Do not hardcode "fill 12%".

### Systemic #3 — 0% LTCG harvest + Roth conversion FIGHT for the same bracket
LTCG stacks *on top of* ordinary income. The 0%-LTCG ceiling ($49,450 in 2026) is the **same line** as the top of the 12% ordinary bracket.

Fill 12% with a conversion → 0%-LTCG room becomes **$0** → harvested gains retroactively become 15%.

Step 2 (harvest 0% LTCG) and Step 3 (fill 12% with conversion) are **mutually exclusive** uses of one bracket. Algorithm silently understates tax.

**FIX:** never both in same year. Prefer 0% LTCG harvest for a Thai resident (converts to grandfathered basis at zero cost) over conversion.

### Systemic #4 — Grandfathering (Paw 162) is over-applied
- Starting balances in 2026 are NOT all "pre-2024 principal"
- 2024→2026 growth is post-2024 assessable
- **Retirement account distributions** are "earned" at distribution (post-2024) → **no grandfathering at all** for IRA/Roth remittances
- The algorithm's tier-1 "grandfathered = tax 0" sources systematically understate Thai tax

**FIX:** default to **conservative post-2024** for everything. Optional "as-of-Jan-1-2024 value" input only for **cash / taxable brokerage**, gated behind traceability warning. Never grandfather retirement accounts.

## Corrections to Facts I Had Wrong

- **HSA foreign medical services** DO qualify for US-tax-free distribution under IRC §213(d) (hospital/doctor visits abroad, even in Thailand). Foreign prescription drugs mostly don't qualify (insulin excepted). BUT Thailand still taxes the remitted amount — my earlier claim that HSA-qualified was "zero on both sides" was wrong.
- **FX direction:** 10 THB/USD would be THB *strengthening* → USD holder is DEVASTATED (dollar buys less THB). THB *weakening* to 40 helps the USD holder. I had this backwards in my algorithm comments.
- **NIIT & Roth conversions:** conversions raise MAGI → can trigger NIIT on OTHER investment income. Hidden cost of aggressive conversion.
- **RMD source:** must be prior 12/31 balance; must precede conversions in the same year.

## New Levers Oracle Identified

### D1a — SBLOC (borrow against portfolio)
- Loan proceeds are **not income** in either country
- Fund THB spending via a securities-backed line of credit → **no assessable remittance income**
- Trade-off: interest cost, margin call risk
- **v2 feature** — worth modeling as advanced option

### D1b — Thai residency days as a CONTROL VARIABLE
- Dual citizen spending <180 days in Thailand in a given year = **NOT a Thai tax resident that year**
- Foreign remittances in a non-resident year → **zero Thai tax**
- Bunch big Roth conversions or realizations into non-resident years
- Pre-position cash in Thailand during non-resident years
- **Algorithm currently treats residency as fixed** — this is a HUGE missed lever

### D2 — Regulatory uncertainty bands
Ship optimistic/pessimistic scenarios for FIVE unsettled items:
1. Roth treated as pension in Thailand? (likely yes, unsettled)
2. IRA distribution grandfathering (likely no, unsettled)
3. **Treaty re-sourcing of US-source pensions** (biggest single swing)
4. Thai 50% pension deduction eligibility for foreign pension
5. NIIT creditability against Thai tax (contested; *Christensen*, *Bruyea* cases)

Delta between optimistic and pessimistic = user's regulatory exposure.

## Objective Function Reframe (D5 — deepest flaw)

"Minimize lifetime tax" is a **sub-goal, not the goal**. Minimizing tax can increase ruin risk:
- Over-converting prepays tax
- Depletes liquid bridge assets
- Worsens sequence-of-returns risk

**Correct primary objective:** maximize **P(meeting spending for life)** and after-tax terminal wealth utility. Tax engine = cost module inside longevity optimizer.

## Sanity Check Walkthrough (D3 — worked example)

$50k Traditional IRA remitted at 35 THB/USD = 1,750,000 THB:
- **US tax:** $50k − $15,750 std ded = $34,250 → ~$3,850
- **Thai tax:** 1,750,000 − 100k (if 50% deduction) − 60k = 1,590,000 assessable → PIT ≈ **262,500 THB ≈ $7,500**
- **If treaty re-sourcing works:** Thailand primary, collects $7,500; US treats as foreign-source, credits Thai, US = $0. **Total = $7,500 (~15%)**. $3,650 of Thai tax is excess/wasted FTC.
- **If re-sourcing fails:** US $3,850 + Thai $7,500 = **$11,350 (22.7% double tax)**
- Algorithm's dual-credit computed LESS than either — pure bug.

E3 (age 74 RMD): $500k Traditional, divisor 25.5 → **RMD ≈ $19,600** (~1 year's spending). Modest US tax ~$385. **Proves aggressive age-55 conversion was unnecessary.**

## v2 Corrected Algorithm (sketch from Oracle)

```
For each Monte Carlo trial:
  Draw stochastic factors: US/Thai/Intl/Cash returns, US inflation, Thai inflation, USD/THB FX
  Draw regulatory scenario: {Roth-taxed by Thailand?, treaty re-sources?, grandfather?, NIIT credit?}

  For each year:
    State: balances by (account × currency), taxable lots (basis, date), Roth clocks,
           age/DOB, cumulative-days-in-Thailand-this-year, regulatory scenario
    
    # Decision variables per year:
    - How many days in Thailand this year? (residency control)
    - How much THB spending vs. USD spending?
    - Which accounts to draw from?
    - Roth conversion this year? How much?
    
    # Constraint: cover spending in appropriate currency
    # Constraint: RMD floor if age >= RMD_age
    # Constraint: no negative balances, respect 5-yr Roth clocks, penalty rules
    
    # Objective per-year: minimize combined tax cost while satisfying constraints
    # But wrap in longevity: don't blow through cash bridge or trigger ruin
    
    # Corrected tax pass:
    # For each remitted income item, determine primary taxer per treaty article
    # Apply primary tax
    # Apply secondary FTC (limited by domestic tax on same item)
    # Track NIIT trigger from MAGI creep

  Track terminal wealth + spending shortfalls

Success = P(no ruin AND spending met AND terminal wealth > 0 at life expectancy)
```

## Must-fix vs Nice-to-have

**MUST-FIX before v1 code:**
1. Rebuild FTC/sourcing engine (one primary taxer per item)
2. Replace "fill 12%" with a Thai-aware value test (may say "convert nothing")
3. Default no grandfathering; require explicit Jan-1-2024 snapshot for cash/taxable only
4. Reframe objective to P(success) not tax min
5. Add Thai residency days as user input per year (or default = full-year resident)
6. Add regulatory scenario bands (optimistic/pessimistic)
7. Add filing status input (single default)
8. Fix bracket conflict: 0% LTCG harvest OR Roth conversion, not both

**v1.1 nice-to-have:**
- 72(t) SEPP mechanics for pre-59.5
- Pro-rata basis (Form 8606)
- Specific-lot ID (HIFO)
- Per-plan RMD mechanics

**v2:**
- SBLOC modeling
- Pro-rata basis
- State tax
- FEIE if user has consulting income
- Multi-year DP optimization
