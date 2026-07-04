# v2 Backlog

Deferred from v1 per `.omo/plans/v1-work-plan.md`. Each item cites the
research file(s) that justify the deferral.

## 1. MFJ / MFS filing status support

v1 supports single filer only. Add Married Filing Jointly and Married
Filing Separately. MFJ 2026 standard deduction = $32,200; MFJ 12% bracket
top = $99,450; MFJ NIIT threshold = $250k; MFS gets punitive halved
thresholds. Impacts `us-tax.ts`, `constants.ts`, and form UI.

Ref: `.research/01-us-federal-tax.md` §1-4.

## 2. 72(t) SEPP explicit modeling

v1 applies a flat 10% penalty on pre-59.5 Traditional withdrawals. Real
users use 72(t) SEPP (Substantially Equal Periodic Payments) to avoid
the penalty. Model the three methods (RMD, Fixed Amortization, Fixed
Annuitization), the 5-year OR-to-59.5-lockout rule, and modification-
triggers-retroactive-penalty behavior.

Ref: `.research/04-drawdown-strategy.md` §6.

## 3. Rule of 55 explicit modeling

Someone who separates from employment at age 55+ can withdraw from that
specific employer's 401(k) penalty-free. v1 does not model this. Add a
per-account "separated at 55+" flag on Traditional 401(k) accounts.

Ref: `.research/04-drawdown-strategy.md` §6.

## 4. Form 8606 pro-rata basis tracking

Traditional IRAs can have non-deductible basis (backdoor Roth remainder,
etc.). Withdrawals and conversions must be pro-rata across pre-tax vs
after-tax. v1 assumes zero basis. Add optional basis-in-Traditional
field per account. Impacts drawdown and conversion tax calculations.

## 5. Specific-lot / HIFO tracking for taxable brokerage

v1 splits taxable brokerage draws proportionally between basis and gain.
Real users can select specific lots (HIFO / SpecID) to minimize LTCG
realization. Add per-lot tracking: `{basis, purchaseDate, quantity}`.
Impacts remittance solver and LTCG stack computation.

## 6. Per-plan 401(k) RMD separation

RMDs across multiple 401(k) plans must be taken from EACH plan separately
(unlike IRAs which aggregate). v1 aggregates across Traditional 401(k)
and Traditional IRA. Split Traditional 401(k) RMDs per-plan.

Ref: `.research/01-us-federal-tax.md` §5.

## 7. US state tax

v1 models US federal tax only. Add optional US state tax (CA, NY, TX, FL,
WA, TN as common cases). Include state ordinary income brackets and
state LTCG treatment. Important for users domiciled in a US state before
moving to Thailand.

## 8. FEIE / Foreign Earned Income Exclusion

Retirees may have some earned income (consulting, part-time work). FEIE
excludes up to $126,500 (2024) of foreign earned income from US tax if
physical presence or bona fide residence test is met. Add optional
earned-income input field. See IRS Form 2555.

## 9. SBLOC (buy-borrow-die) modeling

Securities-Based Line of Credit lets retirees borrow against portfolio
without triggering a taxable sale. Combined with step-up at death, this
is a legitimate tax-minimization strategy. Add SBLOC line-of-credit
input; model interest cost + collateral maintenance. Advanced feature.

## 10. QCDs (Qualified Charitable Distributions)

Age 70.5+ can donate up to $105k/yr directly from IRA to charity; counts
toward RMD but not AGI. v1 skips this. Add charitable-intent input;
deduct QCDs from RMD before ordinary income calculation.

Ref: `.research/04-drawdown-strategy.md` §4.

## 11. Multi-year DP optimization

v1 uses per-year greedy heuristics (drawdown ordering, value-test Roth
conversion). A multi-year dynamic-programming optimizer could produce
meaningfully better plans by looking ahead 5-10 years. Explore backward
induction with state = (account balances, cumulative basis). Big compute,
big potential value.
