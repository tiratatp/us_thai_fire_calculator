# US-Thailand Income Tax Treaty (1996) — Reference for Dual Citizen Retiree

## 1. Treaty Location & Status

- **Official text (IRS):** https://www.irs.gov/pub/irs-trty/thailand.pdf
- **Technical Explanation (Treasury):** https://www.irs.gov/pub/irs-trty/thaitech.pdf
- **IRS treaty page:** https://www.irs.gov/businesses/international-businesses/thailand-tax-treaty-documents
- Signed Nov 26 1996; entered into force Dec 15 1997
- Effective Jan 1 1998 (general); Jun 1 1998 (withholding at source)
- **No protocol amendments have entered into force as of 2026.**

## 2. Article Map for Retirees

| Article | Title | Retirement Relevance |
|---------|-------|---------------------|
| 4 | Residence | Tie-breaker: permanent home → vital interests → habitual abode → nationality |
| 10 | Dividends | Max source withholding 15% (10% if ≥25% corporate holding) |
| 11 | Interest | Max source withholding 15%; certain government/bank exempt |
| 13 | Capital gains | Real estate taxed where situated; other gains taxed only in residence state |
| **20** | **Pensions & Social Security** | Critical — see below |
| 21 | Government service | Government pensions taxed only in residence state if resident+national |
| **25** | **FTC / Relief from double taxation** | Both countries grant credit |

## 3. Article 20 Detail (CRITICAL)

**Text (paraphrased):**
- ¶1: Pensions and similar remuneration for past employment taxable **only in the residence state**
- ¶2: **Social Security and similar public pensions taxable ONLY in the paying state** (US)
- ¶3: Annuities taxable only in residence state

### 3a. Traditional 401(k)/IRA to Thai-resident US citizen
- Treaty grants exclusive taxing right to Thailand (residence state) under ¶1
- **BUT** the Saving Clause (Art. 1 ¶2) lets US tax its citizens as if treaty didn't exist
- Art. 20(1) is **subject to saving clause** (per Technical Explanation)
- **Result:** BOTH countries tax; FTC required

### 3b. Roth IRA/401(k) to Thai-resident US citizen
- Treaty predates Roth (created 1997, treaty signed 1996)
- Treaty's "pension" definition doesn't distinguish Roth
- **US:** Domestic law → qualified Roth distributions tax-free (unaffected by treaty)
- **Thailand:** No statutory recognition of Roth. May treat as taxable pension income when remitted
- **UNSETTLED AREA** — no binding authority. Practitioners assume Thailand will tax remitted Roth.
- **DESIGN IMPLICATION:** Calculator should treat Roth as Thailand-taxable pension on remittance in worst case, with an "assume treaty protection" toggle for optimistic case.

### 3c. US Social Security to Thai-resident US citizen
- Art. 20(2) is **excepted from saving clause** (Art. 1 ¶3(a) preserves ¶2 and ¶5)
- **Thailand CANNOT tax US Social Security** under the treaty. Exclusive US tax.
- (Not in v1 calculator per user, but noted.)

## 4. Article 25 (FTC) Mechanics

- ¶1 (US side): US grants credit for Thai tax paid by US citizen/resident
- ¶2 (Thailand side): Thailand grants credit for US tax on US-source income
- ¶3 (source rules): Income taxable in other state under treaty deemed to arise there
- **FTC limitation:** Credit ≤ domestic tax on that income (both directions)
- US uses worldwide basketing (IRC §904); Thailand FTC governed by domestic law

## 5. Saving Clause Exceptions (Survive for US Citizens)

Articles that retain treaty benefits for US citizens:
- **Art. 20(2)** — SS taxed only by paying state (US)
- **Art. 20(5)** — child support
- **Art. 25** — FTC (both directions)
- **Art. 26** — non-discrimination
- **Art. 27** — Mutual Agreement Procedure

Articles that **do NOT survive** for US citizens (US can still tax):
- Art. 10 (dividends), Art. 11 (interest), Art. 13 (cap gains), Art. 20(1) (private pensions), Art. 20(3) (annuities)

## 6. Practical Tax Stack for Thai-Resident US Citizen

For US pension income remitted to Thailand:

| Step | Action |
|------|--------|
| 1 | US taxes worldwide income (saving clause preserves) |
| 2 | Thailand taxes remitted foreign income (post-2024 Por 161/2566) |
| 3 | US grants FTC on Thai tax paid (Form 1116) |
| 4 | Thailand grants FTC on US tax paid on US-source income |
| 5 | Net = higher of two effective rates (approx.), minus FTC coordination |

### Per-income treatment matrix

| Income | US tax | Thai tax when remitted | Notes |
|--------|--------|-----------------------|-------|
| Traditional 401(k)/IRA | Yes (ordinary) | Yes (pension income) | FTC eases double tax |
| Roth qualified distribution | No | **Likely yes** (unsettled) | Design for worst case |
| Taxable brokerage gain | Yes (LTCG) | Yes (only gain portion) | Basis remitted = not assessable |
| Cash / already-taxed savings | No | Depends: pre-2024 exempt; post-2024 earnings taxable | Paw 162/2566 grandfathers pre-2024 |
| US Social Security | Yes (up to 85%) | **NO** (Art. 20(2) saved) | Exclusive US tax |

## 7. Design Implication for Calculator

- Assume worst case (Roth treated as pension income by Thailand on remittance)
- Provide toggle: "Assume treaty protects Roth" (optimistic)
- Model FTC as: `credit = min(us_tax_on_income, thai_tax_on_same_income)`
- Since US uses worldwide basketing, FTC is applied at aggregate level in calculator
- **Grandfathering:** Assets user enters TODAY should be treated as pre-existing (pre-2024) principal → any principal component of a remittance is Thai-exempt. Only earnings accrued after 2024 are Thai-taxable on remittance.
- **Practical simplification for v1:** Treat all NEW investment gains post-retirement-start as Thai-taxable when remitted. Treat entered starting balances as grandfathered principal (Thai-exempt on remittance up to the entered amount).

**⚠️ Not tax advice. Roth treatment unsettled. Consult cross-border advisor.**
