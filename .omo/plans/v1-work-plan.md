# US-Thai FIRE Calculator v1 — Locked Work Plan

Author: Sisyphus (plan agent output, post-Oracle correction).
Purpose: Decision-complete plan a worker can execute without further interview.

---

## 1. Context (locked)

- **Repo**: `git@github.com:tiratatp/us_thai_fire_calculator.git` (empty; needs full scaffold)
- **Local path**: `/Users/tiratatp/Repositories/us_thai_fire_calculator/`
- **Stack**: Vite vanilla-TypeScript + Chart.js 4 + Vitest + Web Worker (mulberry32 PRNG, Cholesky for correlated draws)
- **Deploy target**: GitHub Pages, project pages, base path `/us_thai_fire_calculator/`
- **Deployed URL**: `https://tiratatp.github.io/us_thai_fire_calculator/`
- **Algorithm**: v2 corrected (see `.research/08-algorithm-v2.md`)
- **Filing status**: single filer only (MFJ/MFS deferred to v2)
- **Monte Carlo**: 1000 trials default; user-adjustable; both regulatory scenarios (optimistic + pessimistic) computed and displayed
- **Grandfathering (Paw 162/2566)**: retirement accounts get NONE; Cash + Taxable Brokerage get optional Jan-1-2024 snapshot input

Research is complete and stored in `.research/01…08`:

- `01-us-federal-tax.md` — brackets, RMD table, penalty rules, HSA, FBAR/FATCA
- `02-thai-tax.md` — brackets, allowances, Por 161 / Paw 162, remittance treatment
- `03-us-thai-treaty.md` — Art. 20/25, saving clause, Roth uncertainty
- `04-drawdown-strategy.md` — original v1 (SUPERSEDED by v2)
- `05-monte-carlo.md` — return/vol/correlation/FX defaults, mulberry32
- `06-stack.md` — Vite/Chart.js/deploy YAML
- `07-oracle-critique.md` — adversarial review (the WHY behind v2)
- `08-algorithm-v2.md` — LOCKED algorithm to implement

Non-negotiable constraints:

- TypeScript strict + `noUncheckedIndexedAccess`
- Every numeric constant lives in `src/data/constants.ts` with `{value, sourceUrl, sourceName, retrievedDate, notes}`
- Methodology page reads constants directly (single source of truth)
- Every user-visible rule mention → anchor in methodology page
- All computation client-side (no backend)
- 250 LOC ceiling per file
- **TDD floor**: every rule / algorithm change gets a failing test first

---

## 2. File Tree (with LOC estimates)

```
us_thai_fire_calculator/
├── .github/workflows/deploy.yml                (~40)
├── .gitignore                                  (~20)
├── README.md                                   (~80)
├── LICENSE                                     (MIT drop-in)
├── index.html                                  (~60)
├── package.json                                (~35)
├── tsconfig.json                               (~30)
├── vite.config.ts                              (~25)
├── vitest.config.ts                            (~15)
├── public/favicon.svg                          (~10)
├── src/
│   ├── main.ts                                 (~150)
│   ├── types.ts                                (~220)
│   ├── storage.ts                              (~90)
│   ├── data/
│   │   ├── constants.ts                        (~240)
│   │   ├── defaults.ts                         (~180)
│   │   └── constants.test.ts                   (~120)
│   ├── engine/
│   │   ├── prng.ts (+.test.ts)                 (~90 / ~110)
│   │   ├── cholesky.ts (+.test.ts)             (~100 / ~140)
│   │   ├── fx.ts (+.test.ts)                   (~100 / ~120)
│   │   ├── inflation.ts                        (~90)
│   │   ├── us-tax.ts (+.test.ts)               (~230 / ~240)
│   │   ├── thai-tax.ts (+.test.ts)             (~200 / ~220)
│   │   ├── rmd.ts (+.test.ts)                  (~110 / ~130)
│   │   ├── ftc.ts (+.test.ts)                  (~200 / ~230)
│   │   ├── remittance.ts (+.test.ts)           (~230 / ~230)
│   │   ├── roth-conversion.ts (+.test.ts)      (~180 / ~200)
│   │   ├── drawdown.ts (+.test.ts)             (~240 / ~240)
│   │   └── monte-carlo.ts (+.test.ts)          (~240 / ~200)
│   ├── workers/
│   │   ├── monte-carlo.worker.ts               (~120)
│   │   └── monte-carlo.worker.test.ts          (~80)
│   ├── methodology/
│   │   ├── content.ts                          (~240)
│   │   └── render.ts                           (~180)
│   ├── ui/
│   │   ├── form.ts (+.test.ts)                 (~240 / ~160)
│   │   ├── results.ts                          (~200)
│   │   ├── year-table.ts (+.test.ts)           (~230 / ~120)
│   │   ├── charts.ts                           (~240)
│   │   ├── methodology-page.ts                 (~200)
│   │   └── format.ts                           (~90)
│   └── style.css                               (~240)
├── tests/
│   └── scenarios.test.ts                       (~240)
└── .research/                                  (already present, read-only inputs)
```

Total src TS ≈ 5,900 LOC. Every file ≤ 240 LOC. Splits happen mid-wave if a file breaches ceiling.

---

## 3. Dependency Graph & Waves

| Wave | Tasks (parallel unless noted) | Blocks |
|------|-------------------------------|--------|
| 1 | T1 (solo) | everything |
| 2 | T2, T18 | Wave 3, deploy |
| 3 | T3, T4, T5, T6, T15 | Wave 4-6 |
| 4 | T7, T13 | Wave 5, 9 |
| 5 | T8, T9 | Wave 6 |
| 6 | T10 (solo, ultrabrain) | Wave 7 |
| 7 | T11 (solo) | Wave 8 |
| 8 | T12 (solo) | Wave 10 |
| 9 | T14 (solo) | Wave 10 |
| 10 | T16 (solo) | Wave 11 |
| 11 | T17 (solo) | Wave 12 |
| 12 | T19 (solo, acceptance gate) | Wave 13 |
| 13 | T20, T21 | none |

Critical path: T1 → T2 → T4 → T7 → T8 → T10 → T11 → T12 → T14 → T16 → T17 → T19 → T20.

---

## 4. Tasks (all details inlined)

Each task lists: **description**, **files**, **depends**, **wave**, **category**, **skills**, **QA scenarios**, **verify command**.

---

### T1 — Scaffold Vite + TS + Vitest toolchain

**Description**: Initialize the repository skeleton. Run `npm create vite@latest . -- --template vanilla-ts` (or manually author equivalent files). Install `chart.js@^4.4`, `vitest@^3.1`. Author `tsconfig.json` (strict + `noUncheckedIndexedAccess` + `lib: ["ES2022","DOM","DOM.Iterable","WebWorker"]`). Author `vite.config.ts` with `base: '/us_thai_fire_calculator/'` and `manualChunks: { chart: ['chart.js'] }`. Author `vitest.config.ts` with `test.globals = true`. Strip Vite demo boilerplate. Add `.gitignore` (node_modules, dist, coverage). Commit `chore: scaffold Vite + TS + Vitest`.

**Files**: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `index.html` (minimal 3-tab shell placeholder), `src/main.ts` (empty placeholder), `public/favicon.svg`.

**Depends**: none. **Wave**: 1.
**Category**: `quick`.
**Skills**: `programming`, `git-master`.

**QA scenarios**:
1. **Toolchain smoke**: Run `npm ci && npm run typecheck && npm run test && npm run build`. Expected: all 4 commands exit 0. Empty test suite is acceptable but `tsc --noEmit` and `vite build` must succeed. Artifact: shell transcript pasted into notepad.
2. **Base path present**: `grep "base:" vite.config.ts` → matches `/us_thai_fire_calculator/`.
3. **Strict TS confirmed**: `grep '"strict": true' tsconfig.json` and `grep '"noUncheckedIndexedAccess": true' tsconfig.json` both match.
4. **Chart.js pinned**: `jq '.dependencies["chart.js"]' package.json` returns a `^4.` string.

**Verify command**: `npm ci && npm run typecheck && npm run test && npm run build && grep -q "/us_thai_fire_calculator/" vite.config.ts && grep -q noUncheckedIndexedAccess tsconfig.json`.

---

### T2 — Types + constants + defaults (single source of truth)

**Description**: Author `src/types.ts` (all shared interfaces: `AccountType`, `Currency`, `Account`, `UserInputs`, `Expenses`, `Assumption`, `RegulatoryScenario`, `YearOutcome`, `SimResult`, `RemittanceItem`; discriminated unions where sensible; branded `Money` type per programming skill). Author `src/data/constants.ts` with `Cited<T> = {value:T; sourceUrl; sourceName; retrievedDate; notes}` wrapper around every numeric: US 2025 + 2026 ordinary brackets (single), LTCG brackets, standard deduction, NIIT threshold, RMD Uniform Lifetime Table 72-120+, SECURE 2.0 age boundary rules, Thai PIT brackets, Thai personal allowance, Thai pension deduction cap, HSA penalty rates. Author `src/data/defaults.ts` with default `Assumption` (Vanguard VCMM forward-looking returns, correlation matrix, US inflation, Thai inflation, USD/THB FX), default portfolio stock allocation per account type. Author `src/data/constants.test.ts` asserting: brackets monotonic top-ascending; RMD divisors strictly descending from age 72 to 120; correlation matrix symmetric + positive semi-definite.

**Files**: `src/types.ts`, `src/data/constants.ts`, `src/data/defaults.ts`, `src/data/constants.test.ts`.

**Depends**: T1. **Wave**: 2.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Type-check passes**: `npm run typecheck` → 0 errors. Artifact: exit code.
2. **Constants tests green**: `npm run test -- src/data` → all tests pass. Includes:
   - "US ordinary single 2026 brackets are monotonic ascending in `top`."
   - "LTCG 2026 thresholds match: 0% ≤ $49,450 single."
   - "RMD Uniform Lifetime divisors strictly descending 72→120."
   - "Correlation matrix is 4×4, symmetric, diagonals = 1, PSD (all eigenvalues ≥ 0)."
   - "Every `Cited<T>` has non-empty `sourceUrl` and `sourceName`."
3. **Citation coverage**: `grep -c "sourceUrl:" src/data/constants.ts` returns a number ≥ 25 (matches count of distinct rules).
4. **No file breaches LOC ceiling**: `wc -l src/data/*.ts` → each ≤ 250.

**Verify command**: `npm run typecheck && npm run test -- src/data && awk 'END{print NR}' src/data/constants.ts | awk '$1 <= 250 {exit 0} {exit 1}'`.

---

### T3 — PRNG + Cholesky + FX + Inflation (pure math primitives)

**Description**: TDD-first. Write `prng.test.ts` (determinism under fixed seed, uniform sample smoke test), `cholesky.test.ts` (`L·Lᵀ = Σ` within 1e-10 tolerance, correlated draws recover input correlation within 3σ after 100k samples), `fx.test.ts` (log-normal walk deterministic under seed, mean drift = 0 within 3σ over 10k samples). Then implement mulberry32 + Box-Muller pair, Cholesky decomposition + correlated multivariate normal draw, FX log-normal walk, US + Thai inflation draws. All functions pure (accept RNG closure, return numbers). No global state.

**Files**: `src/engine/prng.ts`, `src/engine/prng.test.ts`, `src/engine/cholesky.ts`, `src/engine/cholesky.test.ts`, `src/engine/fx.ts`, `src/engine/fx.test.ts`, `src/engine/inflation.ts`.

**Depends**: T2. **Wave**: 3.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **PRNG determinism**: `const r1 = mulberry32(42); const r2 = mulberry32(42); expect(r1()).toBe(r2())` × 100 iterations.
2. **PRNG range**: 10,000 samples all in [0,1); mean within [0.49, 0.51].
3. **Cholesky correctness**: For the default 4×4 correlation matrix, reconstruct `Σ = L·Lᵀ`; max abs diff < 1e-10.
4. **Correlated draws**: 100,000 correlated draws recover input off-diagonal correlations within ±0.02.
5. **FX log-normal walk**: Given seed=1 and 30 steps, output sequence is byte-identical across runs.

**Verify command**: `npm run test -- src/engine/prng src/engine/cholesky src/engine/fx src/engine/inflation`.

---

### T4 — US federal tax engine

**Description**: TDD-first. Author `src/engine/us-tax.test.ts` covering: bracket boundary at each edge (10 → 12, 12 → 22, ..., 35 → 37 for single 2026); LTCG stack with ordinary crowding (harvested gain moves from 0% → 15% when ordinary pushes above threshold); NIIT on investment income above MAGI $200k single (not indexed); std-ded application; HSA non-medical pre-65 20% penalty + income tax; HSA post-65 non-medical ordinary income only. Then implement `usOrdinaryTax(taxable, brackets)`, `usLtcgStackTax(ordinaryTaxable, ltcg, ltcgBrackets)`, `usNiit(magi, netInvIncome, threshold)`, `usHsaPenalty(amount, age, isMedical)`. Read brackets from `src/data/constants.ts`.

**Files**: `src/engine/us-tax.ts`, `src/engine/us-tax.test.ts`.

**Depends**: T2. **Wave**: 3.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Boundary $49,725 single 2026**: expected US tax on $49,725 taxable = $12,225 × 10% + ($49,725 - $12,225) × 12% = $1,222.50 + $4,500 = $5,722.50 exactly.
2. **LTCG stack**: ordinary $30,000 + LTCG $30,000; taxable ordinary after std ded $14,250 → LTCG 0% room = $49,450 - $14,250 = $35,200; all $30k LTCG at 0% → total US tax = ordinary bracket tax on $14,250 + 0.
3. **LTCG crowded**: ordinary $60,000 + LTCG $30,000; taxable ordinary after std ded $44,250 → LTCG 0% room = $49,450 - $44,250 = $5,200; $5,200 at 0% + $24,800 at 15% = $3,720 LTCG tax.
4. **NIIT triggered**: MAGI $220,000 single, NII $30,000 → NIIT = 3.8% × min($30,000, $20,000) = $760.
5. **HSA pre-65 non-medical**: $10,000 withdrawal at age 55 → 20% penalty $2,000 + full ordinary income addition.
6. **HSA post-65 non-medical**: $10,000 at age 70 → no penalty, full ordinary income addition.

**Verify command**: `npm run test -- src/engine/us-tax`.

---

### T5 — Thai PIT engine

**Description**: TDD-first. Author `src/engine/thai-tax.test.ts` covering: 0/5/10/15/20/25/30/35 boundary transitions; personal allowance 60,000 THB; 50% pension deduction capped at 100,000 THB gated on regulatory scenario flag `thaiPensionDeductionApplies`; residency short-circuit (`isThaiResident === false` → returns 0 regardless of remittance); pre-2024 grandfathered principal excluded from assessable base for Cash + Taxable ONLY (never retirement accounts); brokerage capital-gain portion only assessable (basis excluded); SET-listed exempt. Then implement `thaiPit(assessableIncomeThb, allowances, brackets)`, `thaiAssessableFromRemittance(item, regScenario, snapshots)`.

**Files**: `src/engine/thai-tax.ts`, `src/engine/thai-tax.test.ts`.

**Depends**: T2. **Wave**: 3.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Boundary 500,001 THB**: assessable 500,001; tax = 0 up to 150k + 5% × 150k + 10% × 200k + 15% × 1 = 0 + 7,500 + 20,000 + 0.15 = 27,500.15 THB.
2. **Personal allowance applied**: assessable 200,000 THB gross - 60,000 allowance = 140,000 net → 0 tax (below first bracket).
3. **Pension deduction gated**: with `thaiPensionDeductionApplies=true` and pension income 1,750,000 THB, deduction = min(100,000, 0.5 × 1,750,000) = 100,000. With flag false, deduction = 0.
4. **Residency short-circuit**: `thaiPit(remittance=$50k, isThaiResident=false)` → 0.
5. **Retirement account grandfather rejected**: `thaiAssessableFromRemittance(item={type:'TraditionalIRA', pre2024Snapshot: 300000, remitted: 500000})` → assessable = 500,000 (snapshot ignored for retirement accounts).
6. **Taxable brokerage basis excluded**: `thaiAssessableFromRemittance(item={type:'TaxableBrokerage', basis: 400000, remitted: 500000})` → assessable = 100,000 (only gain).

**Verify command**: `npm run test -- src/engine/thai-tax`.

---

### T6 — RMD engine

**Description**: TDD-first. Test cases: DOB → RMD-age boundary (born before 7/1/1951 → 73; born 7/2/1951 through 12/31/1959 → 73; born 1960+ → 75) per SECURE 2.0; Uniform Lifetime Table lookup ages 72-120; `rmd = priorYearEndBalance / divisor`; aggregate across Traditional IRA + Traditional 401k (v1 simplification — v2 splits per plan); NO RMD for Roth or HSA. Then implement `rmdAge(birthYear)`, `rmdAmount(priorYearEndBalance, age, table)`.

**Files**: `src/engine/rmd.ts`, `src/engine/rmd.test.ts`.

**Depends**: T2. **Wave**: 3.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Boundary 1959 vs 1960**: `rmdAge(1959) === 73`, `rmdAge(1960) === 75`.
2. **Age 73 divisor**: `rmdAmount(500000, 73)` → 500,000 / 26.5 = 18,867.92 ≈ 18,867.92 (allow 0.01 tolerance).
3. **Age 74 canonical (Oracle E3)**: `rmdAmount(500000, 74)` → 500,000 / 25.5 = 19,607.84.
4. **No RMD for Roth**: `rmdAmount(500000, 74, accountType='RothIRA')` → 0.
5. **Below RMD age**: `rmdAmount(500000, 72)` → 0 (age < RMD age).

**Verify command**: `npm run test -- src/engine/rmd`.

---

### T7 — FTC engine (corrected, per-item) [HIGHEST-RISK COMMIT]

**Description**: TDD-first. Author `src/engine/ftc.test.ts` with the Oracle D3 worked example as the anchor: per-item primary-taxer selection per treaty (Traditional/Roth → Thailand primary via Art. 20(1); LTCG remittance → Thailand primary via Art. 13; cash pre-2024 → US primary if any US tax event; cash post-2024 → Thailand primary if remitted while Thai-resident). With `treatyResourcesUsSourcePensions=true`, US FTC = min(usTaxOnItem, thaiTaxOnItem); with flag false, both taxes stand → double tax. NIIT credit toggle (`niitCreditableAgainstThai`) affects FTC pool. **NEVER double-credit** regression test (Systemic #1): Thai side does not also credit US on the same item after US-primary case. Then implement `computeFtc(remittanceItems: RemittanceItem[], regScenario: RegulatoryScenario, usTaxByItem, thaiTaxByItem)` returning `{usTaxAfterFtc, thaiTaxAfterFtc}` with the correct single-primary-taxer semantics.

**Files**: `src/engine/ftc.ts`, `src/engine/ftc.test.ts`.

**Depends**: T4, T5. **Wave**: 4.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **D3 optimistic (re-sourcing on)**: $50k Traditional IRA remitted at FX 35; US tax on item $3,850; Thai tax on item $7,500. Expected: US net = $0 (FTC = $3,850), Thai net = $7,500. **Total = $7,500**.
2. **D3 pessimistic (re-sourcing off)**: same inputs, `treatyResourcesUsSourcePensions=false`. Expected: US net = $3,850, Thai net = $7,500. **Total = $11,350**.
3. **Never below the higher**: for D3 optimistic, `computeFtc` NEVER returns total < $7,500 (Systemic #1 regression).
4. **Roth remittance**: $30k Roth IRA remitted; US tax on item = $0; Thai tax on item = $4,000. Expected: US = $0 (no US tax → no FTC needed), Thai net = $4,000, TOTAL = $4,000. FTC is one-way — Thai does not credit US $0.
5. **LTCG remittance**: $20k gain remitted; US LTCG tax $3,000; Thai tax on gain $2,500. Expected: with re-sourcing on, US FTC = $2,500, US net = $500, Thai net = $2,500, total = $3,000.
6. **NIIT credit toggle**: with `niitCreditableAgainstThai=true`, NIIT $760 added to FTC pool; with false, NIIT stands alone.

**Verify command**: `npm run test -- src/engine/ftc`.

---

### T8 — Remittance solver

**Description**: TDD-first. Test cases: fund THB need from Thai-side accounts first (Thai cash → Thai brokerage); if US remittance required, order by combined tax burden (RMD proceeds → Taxable brokerage 0% LTCG → Taxable brokerage 15% LTCG → Traditional IRA → Roth); basis vs gain split for taxable brokerage (return of basis is 0/0); pre-2024 snapshot subtracted for Cash + Taxable ONLY (never for retirement accounts — Systemic #4 regression); when Thai residency = false that year, foreign remittance triggers no Thai tax; if principal insufficient for THB need, engine escalates to next source or marks year as `spendingUnmet`. Then implement `solveRemittance(thbNeed, availableSources, regScenario, isThaiResident) → RemittanceItem[]`.

**Files**: `src/engine/remittance.ts`, `src/engine/remittance.test.ts`.

**Depends**: T4, T5, T7. **Wave**: 5.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Thai-side first**: THB need 300k, Thai cash 400k available → drawn 300k from Thai cash, 0 remittance from US.
2. **US remittance ordered**: THB need 1,750,000 (= $50k @ 35); no Thai-side; RMD proceeds $0; Taxable 0% LTCG lots available $30k (basis $20k + gain $10k); Traditional IRA $500k → algorithm picks Taxable 0% LTCG first (US $0, Thai gain-only), then Traditional for the rest.
3. **No retirement grandfather** (S5): Traditional IRA remittance $30,000 with a pre-2024 snapshot input of $20,000 for the account → Thai assessable = full $30,000 (snapshot ignored).
4. **Cash grandfather honored**: Cash USD remittance $10,000, pre-2024 snapshot $8,000 → Thai assessable = $2,000.
5. **Non-resident year (S4)**: isThaiResident=false, remit $30k from Traditional → Thai tax on that item = $0.
6. **Insufficient balances → spendingUnmet**: THB need 5,000,000 THB, all balances total 100,000 THB equivalent → returns `{spendingUnmet: true, shortfall: ...}`.

**Verify command**: `npm run test -- src/engine/remittance`.

---

### T9 — Roth conversion value test

**Description**: TDD-first. Test cases: for a Thai-resident year, the value test SHOULD almost always return 0 (Systemic #2 regression — Roth conversion costs US tax with zero Thai benefit); 0% LTCG harvest and Roth conversion are mutually exclusive in the same year (Systemic #3 regression — if `taxableHarvestPlanned > 0`, conversion returns 0); conversion only chosen if `taxable_appreciated_basis_lots < conversion_room_available` AND future-RMD-tax-avoided > current-conversion-tax + Thai-tax-on-eventual-remittance; conversion respects `age < RMD_age` and `TraditionalUS > 0`; NIIT MAGI creep considered. Then implement `valueTestRothConversion(state, regScenario) → number`.

**Files**: `src/engine/roth-conversion.ts`, `src/engine/roth-conversion.test.ts`.

**Depends**: T4, T5, T7. **Wave**: 5.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Thai-resident default → 0**: age 55, Traditional $500k, Roth $500k, Taxable with plenty of 0% LTCG room, Thai-resident, pessimistic scenario → conversion = 0.
2. **0% LTCG mutex (S6)**: same as above but algorithm has ALREADY planned 0% LTCG harvest = $30k → conversion MUST return 0.
3. **Post-RMD-age**: age 74 → conversion = 0 always.
4. **Traditional zero**: TraditionalUS balance = 0 → conversion = 0.
5. **Non-resident year, low LTCG room, high future RMD**: rare case where conversion clears the value test → returns positive amount ≤ min(bracket_12_room, TraditionalUS_balance).

**Verify command**: `npm run test -- src/engine/roth-conversion`.

---

### T10 — Drawdown `year_step` orchestrator [ULTRABRAIN]

**Description**: TDD-first. Encodes `.research/08-algorithm-v2.md` Steps 0-10 verbatim. Test cases: Step 1 RMD executes BEFORE conversions in the same year; Step 2 THB need funded from Thai-side then US remittance; Step 3 USD need funded from USD cash → 0% LTCG lots → Roth → Traditional (**this is where Roth SHINES — no remittance → Thai=0**); Step 4 conversion only via value test (T9); Step 5 US tax = ordinary + LTCG stack + NIIT; Step 6 Thai PIT (only if resident); Step 7 corrected FTC (T7); Step 8 tax paid from correct-currency cash buckets, forced additional withdrawal if underfunded; Step 9 stochastic growth; Step 10 failure = any negative balance OR `spendingUnmet`. Deterministic under seeded returns. Then implement `yearStep(state, yearIdx, returns, regScenario) → newState`.

**Files**: `src/engine/drawdown.ts`, `src/engine/drawdown.test.ts`.

**Depends**: T3, T4, T5, T6, T7, T8, T9. **Wave**: 6.
**Category**: `ultrabrain`.
**Skills**: `programming`.

**QA scenarios**:
1. **RMD before conversion**: age 73, Traditional $500k, prior-year-end same → RMD $18,867.92 recorded before any conversion attempt in the same year.
2. **Roth funds USD travel (S3)**: age 55, USD travel $10k, Roth $500k → Roth withdraws $10k, US tax = $0, Thai tax = $0 (no remittance).
3. **THB from Thai-side first**: THB need 500k, Thai cash 400k, Thai brokerage 200k → Thai cash drawn 400k, Thai brokerage drawn 100k, 0 remittance.
4. **Failure detection**: forced spendingUnmet in a year → state.failed=true, state.failureYear=year.
5. **Determinism**: same seed + same returns array → byte-identical state output over 30 years.
6. **RMD > balance clamp**: Traditional depleted mid-year → clamp RMD to available; do not go negative.

**Verify command**: `npm run test -- src/engine/drawdown`.

---

### T11 — Monte Carlo runner + regulatory band runner

**Description**: TDD-first. Test cases: seeded deterministic across identical inputs; `trials` parameter honored; correlation matrix ⇒ correlated draws via Cholesky (T3); per-year percentile aggregation (P10/P50/P90 across trials); success rate = fraction of trials where portfolio > 0 at life expectancy AND no spendingUnmet year; when `regulatoryStance === 'both'`, runs MC TWICE (optimistic + pessimistic) and returns `{optimistic: SimResult, pessimistic: SimResult}`. Then implement `runMonteCarlo(inputs, assumptions, regScenario, seed, trials) → SimResult` and `runBothRegulatoryScenarios(...) → {optimistic, pessimistic}`.

**Files**: `src/engine/monte-carlo.ts`, `src/engine/monte-carlo.test.ts`.

**Depends**: T3, T10. **Wave**: 7.
**Category**: `deep`.
**Skills**: `programming`.

**QA scenarios**:
1. **Determinism**: `runMonteCarlo(inputs, assumptions, regScenario, seed=42, trials=100)` twice → identical `successRate` and identical P50 array.
2. **Trials honored**: with `trials=100`, internal loop iterates exactly 100 times (spy on RNG call count).
3. **Success rate range**: 0 ≤ successRate ≤ 1 for any input.
4. **Both scenarios returned**: `runBothRegulatoryScenarios(...)` returns two `SimResult` objects; pessimistic successRate ≤ optimistic successRate (in expectation across a well-conditioned input).
5. **Percentile ordering**: for every year, P10 ≤ P50 ≤ P90.

**Verify command**: `npm run test -- src/engine/monte-carlo`.

---

### T12 — Web Worker wrapper

**Description**: Wrap MC runner in a Web Worker via Vite's `new Worker(new URL('./monte-carlo.worker.ts', import.meta.url), { type: 'module' })` pattern. Message contract: `{cmd: 'run', inputs, assumptions, seed, trials}` → `{cmd: 'progress', trialsDone, trialsTotal}` (every 5%) → `{cmd: 'done', result}`. On error, post `{cmd: 'error', message}`. Node-side unit test imports the handler function directly (no real Worker in test).

**Files**: `src/workers/monte-carlo.worker.ts`, `src/workers/monte-carlo.worker.test.ts`.

**Depends**: T11. **Wave**: 8.
**Category**: `unspecified-high`.
**Skills**: `programming`.

**QA scenarios**:
1. **Message contract shape**: handler called with `{cmd:'run', ...}` produces at least one `progress` message and exactly one `done` message.
2. **Progress cadence**: with `trials=1000`, ≥ 19 progress messages sent (every 5%).
3. **Error path**: handler called with invalid inputs → single `error` message with non-empty `message`.
4. **Build chunks worker separately**: `npm run build` produces `dist/assets/monte-carlo.worker-*.js` as a separate file.

**Verify command**: `npm run test -- src/workers && npm run build && ls dist/assets/ | grep -q monte-carlo.worker`.

---

### T13 — UI form (30 fields) + localStorage persistence

**Description**: Author `src/ui/form.ts` — declarative field schema; render into `#inputs-tab`; on change → validate + save to localStorage under `us_thai_fire_v1_inputs`. Fields: currentAge, lifeExpectancy; 7 account types × 2 currencies (balance + optional basis for Taxable + optional Jan-1-2024 snapshot for Cash / Taxable — **UI must DISABLE the snapshot field for retirement account rows**); expenses (housing/food/transport/other THB/mo, healthcare/legalTax THB/yr, travel USD/yr); per-year Thai residency toggle strip (defaults all-resident); MC trials, success threshold, regulatory stance. Restore on page load. Live inline validation (numeric ≥ 0, ages sensible). Also author `src/storage.ts` (typed `save<T>` / `restore<T>` helpers) and `src/ui/format.ts` (Intl.NumberFormat USD + THB helpers).

**Files**: `src/ui/form.ts`, `src/ui/form.test.ts`, `src/storage.ts`, `src/ui/format.ts`.

**Depends**: T2. **Wave**: 4.
**Category**: `visual-engineering`.
**Skills**: `programming`, `frontend`.

**QA scenarios**:
1. **Round-trip persistence**: fill 30 fields, reload page → all 30 fields restore identical values.
2. **Retirement snapshot disabled**: form-schema test asserts `pre2024Snapshot` is `disabled` for `TraditionalIRA/Roth401k/RothIRA/Traditional401k/HSA` rows and `enabled` for `Cash/TaxableBrokerage` rows.
3. **Validation rejects negatives**: entering `-100` in a balance field marks the field invalid + rejects save.
4. **Manual smoke** (Playwright/dev-server): open `npm run dev`, fill 3 sample fields, reload → values persist.

**Verify command**: `npm run test -- src/ui/form src/storage && npm run dev` (developer manually confirms restore).

---

### T14 — Results + year-by-year table + Chart.js visualizations

**Description**: Three components. (a) `src/ui/results.ts` — FIRE verdict card ("FIRE at 90%" or gap explanation) with both regulatory bands + delta. (b) `src/ui/year-table.ts` — HTML table with columns age, per-account balance snapshot (native currency), RMD, Roth conversion, USD tax, Thai tax, FTC applied, remittance amount, US tax breakdown, Thai assessable amount. **Every column header links to a methodology anchor** (`#us-rmd-table`, `#ftc-corrected`, etc.). (c) `src/ui/charts.ts` — Chart.js line chart with P10/P50/P90 percentile bands + stacked bar chart of withdrawal sources per year. Author `src/ui/year-table.test.ts` for the pure data-mapping functions (percentile → dataset shape, row → tds).

**Files**: `src/ui/results.ts`, `src/ui/year-table.ts`, `src/ui/year-table.test.ts`, `src/ui/charts.ts`.

**Depends**: T11, T13. **Wave**: 9.
**Category**: `visual-engineering`.
**Skills**: `programming`, `frontend`.

**QA scenarios**:
1. **Every column header links to a valid methodology anchor**: `for each thHref in table, expect(methodologyAnchorSet.has(thHref)).toBe(true)`.
2. **Percentile datasets shape**: input `SimResult.p10 = number[N]` → chart config has 3 datasets each length N.
3. **Stacked bar sums**: for each year, sum of source amounts ≈ total that year's spending (within 1%).
4. **FIRE badge state**: `result.pessimistic.successRate = 0.92, threshold = 0.90` → badge = "FIRE" (green). `= 0.85` → badge = "Not FIRE" (red).
5. **Visual QA** (Playwright): screenshot Results tab after a sample MC run; verify chart renders and table has ≥ 30 rows.

**Verify command**: `npm run test -- src/ui/year-table && npm run dev` (developer visually checks charts).

---

### T15 — Methodology page (renders from constants)

**Description**: Author `src/methodology/content.ts` (narrative sections keyed by stable anchor ids: `#us-brackets-2026`, `#us-ltcg-2026`, `#us-standard-deduction`, `#us-niit`, `#us-rmd-table`, `#us-secure-2-age`, `#roth-5yr-rules`, `#early-withdrawal-penalty`, `#hsa-post-65`, `#thai-pit-brackets`, `#thai-personal-allowance`, `#thai-pension-deduction`, `#por-161-remittance`, `#paw-162-grandfathering`, `#thai-cgt-set-listed`, `#treaty-article-20`, `#treaty-article-25`, `#saving-clause`, `#treaty-resourcing`, `#roth-uncertainty`, `#ftc-corrected`, `#roth-conversion-value-test`, `#residency-180-days`, `#monte-carlo-defaults`, `#correlation-matrix`, `#mulberry32`, `#disclaimer`). `src/methodology/render.ts` composes narrative + auto-injected tables from `src/data/constants.ts` values with visible source URLs. `src/ui/methodology-page.ts` mounts the rendered content into `#methodology-tab`. Regression test: every anchor referenced by `year-table` column headers exists in the rendered methodology page.

**Files**: `src/methodology/content.ts`, `src/methodology/render.ts`, `src/ui/methodology-page.ts`.

**Depends**: T2. **Wave**: 3.
**Category**: `writing`.
**Skills**: `programming`, `frontend`, `writing`.

**QA scenarios**:
1. **Anchor set consistency**: `contentAnchorSet.superset(yearTableAnchorSet)` — every table anchor exists in content.
2. **Every rule cites a URL**: `render()` output HTML contains `href="https://…"` on every table row (min 25 sourceUrls).
3. **Disclaimer prominent**: rendered HTML contains "Not tax advice" in `<strong>` or `<mark>` near the top.
4. **Constants rendered live**: change a bracket in `src/data/constants.ts` → rendered methodology page reflects the new value (single source of truth).
5. **Manual read-through**: developer reads the rendered page and confirms it explains: bracket-aware ordering, FTC single-primary-taxer rule, no-grandfather-for-retirement, Roth Thai uncertainty, residency-days lever, MC methodology.

**Verify command**: `npm run test -- src/methodology src/ui/methodology-page && npm run dev` (developer opens Methodology tab).

---

### T16 — App bootstrap `main.ts`

**Description**: 3-tab shell (Inputs / Results / Methodology) in `index.html` + `src/main.ts`. Wire form → button "Run simulation" → worker.postMessage → show progress bar → on `done` render Results tab + auto-switch. Persist last result to `us_thai_fire_v1_last_result`. Handle worker errors + display in-UI. Persistent disclaimer banner on Results.

**Files**: `src/main.ts`, `index.html`.

**Depends**: T12, T13, T14, T15. **Wave**: 10.
**Category**: `visual-engineering`.
**Skills**: `programming`, `frontend`.

**QA scenarios**:
1. **End-to-end smoke**: `npm run build && npm run preview` → click Inputs, fill sample fields, click Run → progress bar advances → Results tab activates → FIRE badge visible.
2. **No console errors**: browser console after a full run shows 0 errors and 0 warnings.
3. **Error path**: force worker to throw → UI displays a non-empty error message and does not crash.
4. **Tab persistence**: reload page → last-viewed tab is restored (nice-to-have; not blocking).

**Verify command**: `npm run build && npm run preview` (developer runs the click-through).

---

### T17 — CSS + mobile-friendly layout

**Description**: Mobile-first responsive CSS in `src/style.css`. Breakpoints: default (mobile), 640 px (tablet), 1024 px (desktop). Sticky tab bar; scrollable year-table with sticky first column on mobile; chart auto-resize on orientation change. Accessible focus states; `prefers-reduced-motion` respected. Target Lighthouse mobile perf ≥ 85 for the built site.

**Files**: `src/style.css` (linked from `index.html`).

**Depends**: T16. **Wave**: 11.
**Category**: `visual-engineering`.
**Skills**: `frontend`, `visual-qa`.

**QA scenarios**:
1. **Lighthouse mobile perf ≥ 85**: `lighthouse http://localhost:4173/ --preset=mobile --output=json` → `categories.performance.score ≥ 0.85`.
2. **iPhone SE (375×667) breakpoint**: no horizontal scroll on Inputs / Results / Methodology tabs.
3. **Sticky tab bar** visible while scrolling year-table.
4. **Chart resize** on window resize event triggers Chart.js `chart.resize()` and re-lays out.

**Verify command**: `npm run build && npm run preview & lighthouse http://localhost:4173/ --preset=mobile --output=json --output-path=./lighthouse.json && jq '.categories.performance.score' lighthouse.json`.

---

### T18 — GitHub Actions deploy workflow

**Description**: Author `.github/workflows/deploy.yml` per `.research/06-stack.md` §5. On push to `main`: run `npm ci && npm run test && npm run build`; upload `dist/`; deploy to Pages. Concurrency group `pages`. Document in README that Pages source must be set to "GitHub Actions" in repo Settings → Pages.

**Files**: `.github/workflows/deploy.yml`.

**Depends**: T1. **Wave**: 2.
**Category**: `quick`.
**Skills**: `programming`, `git-master`.

**QA scenarios**:
1. **YAML parses**: `actionlint .github/workflows/deploy.yml` → 0 errors. (Or `python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`.)
2. **Required steps present**: `grep -E "(checkout|setup-node|npm ci|npm run build|upload-pages-artifact|deploy-pages)" .github/workflows/deploy.yml` matches all 6.
3. **Concurrency configured**: `grep "concurrency:" .github/workflows/deploy.yml` matches.
4. **Correct action versions**: uses `actions/deploy-pages@v4` (or the current pinned major from stack doc).

**Verify command**: `actionlint .github/workflows/deploy.yml || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml'))"`.

---

### T19 — Integration / Scenarios Contract execution [ACCEPTANCE GATE]

**Description**: Author `tests/scenarios.test.ts` encoding S1-S7 as end-to-end Vitest scenarios against the engine. Also run manual QA against the deployed URL to confirm GitHub Pages actually renders. No implementation until all 7 pass.

**Files**: `tests/scenarios.test.ts`.

**Depends**: T16, T17. **Wave**: 12.
**Category**: `deep`.
**Skills**: `programming`, `visual-qa`, `playwright`.

**QA scenarios** — all 7 must pass:

1. **S1 — D3 corrected FTC (both bands)**: age 65, life 90, $500k Traditional IRA USD, remit $50k to Thailand at FX=35, Thai resident, single, seed=42.
   - Optimistic (re-sourcing on): total tax ≈ $7,500 (Thai only, US net $0), tolerance ±$50.
   - Pessimistic (re-sourcing off): total tax ≈ $11,350 (US $3,850 + Thai $7,500), tolerance ±$50.
   - Regression: total ≥ higher-of-two = $7,500 in optimistic case (never below).
   - Surface artifact: year-by-year row for age 65 with `us_tax`, `thai_tax`, `ftc_applied` columns visible.

2. **S2 — RMD without conversion (age 74 sanity)**: age 74, Traditional US $500k, no Roth conversions ever, Thai resident, seed=42.
   - RMD = $500,000 / 25.5 = $19,607.84 (±$1).
   - US tax ≈ $385 (±$20).
   - Systemic #2 regression: Roth-conversion module returns 0 in every year.
   - Surface artifact: year-by-year row age 74 shows `RMD = $19,607.84`, `Roth conversion = $0`.

3. **S3 — Roth funds USD travel (Roth shines)**: age 55, USD travel $10k/yr, ample Roth IRA balance, Thai resident, seed=42.
   - Roth withdrawal covers travel: US tax = $0, Thai tax = $0 (no remittance to Thailand).
   - Roth balance decreases by $10k.
   - Surface artifact: year-by-year row age 55, `Thai remittance = $0`, portfolio bar shows Roth stack decreasing.

4. **S4 — Non-resident year → no Thai tax on remittance**: user toggles `thaiResidencyByYear[3] = false`; remits $30k Traditional IRA that year, seed=42.
   - Year 3 Thai tax = $0 (residency short-circuit).
   - US tax on $30k Traditional distribution applies as normal.
   - Surface artifact: year-by-year row year 3, `Thai tax = $0`, `US tax > 0`.

5. **S5 — No grandfathering on retirement accounts (Systemic #4 regression)**: user provides Jan-1-2024 snapshot for Cash and Taxable (allowed at UI level); form disables snapshot field for Traditional IRA row; if snapshot is injected via storage manipulation, engine ignores it.
   - Engine's Thai assessable for a Traditional IRA remittance = full remittance (never subtracts pre-2024 snapshot).
   - Form UI has `disabled` attribute on the retirement-account snapshot inputs.
   - Surface artifact: year-by-year row for the remittance year shows full remittance as `Thai assessable`.

6. **S6 — 0% LTCG vs Roth conversion mutex (Systemic #3 regression)**: age 60, sufficient taxable brokerage with appreciated basis to fill 0% LTCG bracket AND sufficient Traditional to fill 12% ordinary; single; pessimistic scenario; seed=42.
   - In the chosen year: EITHER `Roth conversion = 0` (0% LTCG harvest picked, default) OR `LTCG harvested = 0` (conversion picked). NEVER both non-zero.
   - Engine picks 0% LTCG harvest by default for a Thai resident.
   - Surface artifact: year-by-year row shows exactly one of `Roth conversion` / `LTCG harvested` non-zero.

7. **S7 — FIRE verdict displays both bands**: moderately funded portfolio; `regulatoryStance='both'`; 1000 trials.
   - Results card shows two success rates (optimistic %, pessimistic %) and a "FIRE" badge if pessimistic ≥ threshold.
   - Portfolio chart shows P10/P50/P90 bands with visible fill.
   - Surface artifact: Playwright screenshot of Results tab captures both numbers and the FIRE badge.

Additional manual verification:
- Deployed URL `https://tiratatp.github.io/us_thai_fire_calculator/` returns HTTP 200.
- Loading the deployed URL completes a 1000-trial MC in < 5 seconds on a modern laptop.

**Verify command**: `npm run test -- tests/scenarios && npm run build && curl -sfo /dev/null https://tiratatp.github.io/us_thai_fire_calculator/`.

---

### T20 — README + LICENSE + docs polish

**Description**: Author `README.md` with: what-is-this, screenshot, disclaimer ("Not tax advice; Roth Thai treatment unsettled; consult a cross-border advisor"), dev commands (`npm ci / dev / test / build / preview`), deploy URL, link to methodology page. Author `LICENSE` (MIT). Commit.

**Files**: `README.md`, `LICENSE`.

**Depends**: T15, T19. **Wave**: 13.
**Category**: `writing`.
**Skills**: `git-master`.

**QA scenarios**:
1. **Global tests still green**: `npm run test && npm run build` → 0 failures.
2. **GitHub renders README**: `gh browse README.md` shows the rendered README (developer confirms visually).
3. **Disclaimer present**: `grep -q "Not tax advice" README.md`.
4. **Deploy URL present**: `grep -q "tiratatp.github.io/us_thai_fire_calculator" README.md`.

**Verify command**: `npm run test && npm run build && grep -q "Not tax advice" README.md && grep -q "tiratatp.github.io/us_thai_fire_calculator" README.md`.

---

### T21 — File v2 backlog GitHub Issues

**Description**: Use `gh issue create` to file 11 v2 backlog issues, each with label `v2` and short description referencing the `.research` file supporting it:

1. MFJ / MFS filing status
2. 72(t) SEPP explicit modeling
3. Rule of 55 explicit modeling
4. Form 8606 pro-rata basis
5. Specific-lot / HIFO tracking
6. Per-plan 401(k) RMD separation
7. US state tax
8. FEIE for earned Thai income
9. SBLOC (buy-borrow-die)
10. QCDs (age 70.5+, charitable)
11. Multi-year DP optimization

**Files**: none (GitHub only).

**Depends**: T19. **Wave**: 13.
**Category**: `quick`.
**Skills**: `git-master`.

**QA scenarios**:
1. **11 issues filed**: `gh issue list --label v2 --json number | jq 'length'` → 11.
2. **Each has a description**: `gh issue list --label v2 --json body | jq '.[].body | length > 40'` all true.

**Verify command**: `gh issue list --label v2 --json number | jq 'length == 11'`.

---

## 5. Global Verification Gates per Wave

| Wave | Gate |
|------|------|
| 1 | `npm ci && npm run typecheck && npm run test && npm run build` all pass; empty test suite OK. |
| 2 | Constants tests pass (bracket monotonicity, RMD sanity, correlation PSD); `deploy.yml` YAML parses. |
| 3 | Every wave-3 module has green tests; each file ≤ 250 LOC. |
| 4 | FTC D3 example passes in both re-sourcing directions; form persists + restores 30 fields. |
| 5 | Remittance solver + Roth-value-test tests pass including Systemic #2/#3/#4 regressions. |
| 6 | Drawdown `year_step` reproduces D3 example deterministically under seeded returns; RMD-before-conversion order enforced. |
| 7 | MC runner produces identical results under identical seed; success rate ∈ [0,1]; runs both regulatory scenarios when `stance='both'`. |
| 8 | Worker built by Vite as separate chunk; message contract test passes. |
| 9 | UI tests pass; year-table headers each map to an existing methodology anchor. |
| 10 | End-to-end smoke: form → run → results render, no console errors. |
| 11 | Lighthouse mobile perf ≥ 85; iPhone SE breakpoint visually correct. |
| 12 | **All 7 scenarios (S1-S7) pass**; deployed URL responds 200 and runs. |
| 13 | README renders; 11 v2 issues filed with label `v2`. |

Global constraints (checked every commit):
- `npm run typecheck` (0 errors)
- `npm run test` (0 failing)
- Every file ≤ 250 LOC
- `npm run build` (Vite produces `dist/` without warnings)

---

## 6. Success Criteria (v1 Complete)

1. All 7 scenarios (S1-S7) pass on the deployed URL.
2. `https://tiratatp.github.io/us_thai_fire_calculator/` loads and completes a 1000-trial MC in < 5 s on a modern laptop.
3. Methodology page renders every constant with a citation, and every year-table column links to a valid anchor.
4. `npm run test` = green (≥ 40 test files, ≥ 300 assertions).
5. Lighthouse mobile perf ≥ 85; accessibility ≥ 90.
6. No file exceeds 250 LOC.
7. 11 v2 backlog issues filed with label `v2`.

---

## 7. Commit Strategy

One commit per acceptance unit (test + implementation together). Conventional Commits:

- `chore: scaffold Vite + TS + Vitest toolchain` (T1)
- `feat(data): add tax constants with citation metadata` (T2)
- `feat(data): add default assumptions and correlation matrix` (T2)
- `test(data): assert bracket monotonicity + RMD divisor sanity` (T2)
- `ci: add GitHub Pages deploy workflow` (T18)
- `feat(engine): mulberry32 PRNG + Box-Muller pairs` (T3)
- `feat(engine): Cholesky decomposition + correlated draws` (T3)
- `feat(engine): US federal tax (ordinary, LTCG, NIIT, HSA)` (T4)
- `feat(engine): Thai PIT with pension deduction + residency short-circuit` (T5)
- `feat(engine): RMD table + SECURE 2.0 age boundary` (T6)
- `feat(engine): corrected per-item FTC with treaty re-sourcing flag` (T7)
- `feat(engine): remittance solver honoring basis + pre-2024 snapshot` (T8)
- `feat(engine): value-test Roth conversion mutex with 0% LTCG` (T9)
- `feat(engine): drawdown year_step orchestrator` (T10)
- `feat(engine): Monte Carlo runner + regulatory band runner` (T11)
- `feat(worker): Monte Carlo Web Worker wrapper` (T12)
- `feat(ui): 30-field input form with localStorage persistence` (T13)
- `feat(ui): year-by-year table with methodology anchors` (T14)
- `feat(ui): Chart.js portfolio bands + withdrawal-source stack` (T14)
- `feat(ui): FIRE verdict card with regulatory band delta` (T14)
- `feat(methodology): render page from constants with citations` (T15)
- `feat(app): main.ts bootstrap + tab wiring + worker plumbing` (T16)
- `feat(ui): mobile-first responsive CSS` (T17)
- `test(scenarios): D3 FTC, RMD, Roth-USD, non-resident, no-grandfather, mutex, verdict` (T19)
- `docs: README + LICENSE + disclaimer` (T20)

Rules:
- No amend, no force-push on `main`.
- Every commit passes `npm run typecheck && npm run test && npm run build`.
- Squash-merge feature branches into `main` to keep history flat.
- Never commit `dist/` or `node_modules`.

---

## 8. Execution Instructions for Worker

Execute waves in order. Within a wave, fire independent tasks in parallel via `task(...)`. After each wave, run the wave's verification gate before promoting.

Wave 1:
```
task(category="quick", load_skills=["programming","git-master"], run_in_background=false,
     prompt="Execute T1 from .omo/plans/v1-work-plan.md: scaffold Vite vanilla-TS + Chart.js 4 + Vitest per plan section T1. Run the T1 QA verify command; report output. Commit chore: scaffold Vite + TS + Vitest.")
```

Wave 2 (parallel):
```
task(category="deep", load_skills=["programming"], run_in_background=true,
     prompt="Execute T2 from .omo/plans/v1-work-plan.md: types + constants + defaults with Cited<T> metadata; TDD constants.test.ts. Verify per T2 QA scenarios.")
task(category="quick", load_skills=["programming","git-master"], run_in_background=true,
     prompt="Execute T18 from .omo/plans/v1-work-plan.md: GitHub Actions deploy workflow per .research/06-stack.md §5. Verify per T18 QA scenarios.")
```

Wave 3 (5-way parallel):
```
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T3 from .omo/plans/v1-work-plan.md: PRNG + Cholesky + FX + inflation, TDD-first. Verify per T3 QA.")
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T4 from .omo/plans/v1-work-plan.md: US federal tax engine, TDD-first, boundary tests. Verify per T4 QA.")
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T5 from .omo/plans/v1-work-plan.md: Thai PIT engine, TDD-first, residency short-circuit. Verify per T5 QA.")
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T6 from .omo/plans/v1-work-plan.md: RMD engine, TDD-first, SECURE 2.0 boundary. Verify per T6 QA.")
task(category="writing", load_skills=["programming","frontend","writing"], run_in_background=true, prompt="Execute T15 from .omo/plans/v1-work-plan.md: methodology page from constants + citations. Verify per T15 QA.")
```

Wave 4 (parallel):
```
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T7 from .omo/plans/v1-work-plan.md: corrected per-item FTC, D3 anchor test, never-double-credit regression. Verify per T7 QA.")
task(category="visual-engineering", load_skills=["programming","frontend"], run_in_background=true, prompt="Execute T13 from .omo/plans/v1-work-plan.md: 30-field form + localStorage; disable pre-2024 snapshot for retirement accounts. Verify per T13 QA.")
```

Wave 5 (parallel):
```
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T8 from .omo/plans/v1-work-plan.md: remittance solver with basis + pre-2024 snapshot rules. Verify per T8 QA.")
task(category="deep", load_skills=["programming"], run_in_background=true, prompt="Execute T9 from .omo/plans/v1-work-plan.md: value-test Roth conversion; 0% LTCG mutex. Verify per T9 QA.")
```

Wave 6 (solo, ultrabrain):
```
task(category="ultrabrain", load_skills=["programming"], run_in_background=false, prompt="Execute T10 from .omo/plans/v1-work-plan.md: drawdown year_step orchestrator per .research/08-algorithm-v2.md Steps 0-10. Verify per T10 QA.")
```

Waves 7-13 follow the same pattern — see task definitions above. Each `task(...)` prompt must reference the task's section in this file and require the worker to run the task's Verify command before reporting done.

Final acceptance: after Wave 12, all 7 scenarios (S1-S7) must pass. Only then run Wave 13 (T20 + T21).
