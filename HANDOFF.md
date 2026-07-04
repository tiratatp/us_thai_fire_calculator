# Handoff — v1 Complete (2026-07-04)

Snapshot for the next session or the next-you.

## Status

**v1 is DONE, PUSHED, and DEPLOYED.**

- 32 commits on `main`, all pushed to `origin/main`
- GitHub Actions deploy workflow: passing (37-39s per run)
- Live at: https://tiratatp.github.io/us_thai_fire_calculator/
- Repo: git@github.com:tiratatp/us_thai_fire_calculator.git
- Local path: `/Users/tiratatp/Repositories/us_thai_fire_calculator/`

## What was built

Static-site FIRE calculator for US-Thai dual citizens retiring in Thailand.
Vite vanilla-TS + Chart.js + Vitest. All computation client-side; Monte Carlo
runs in a Web Worker. See `README.md` for the user-facing story and
`AGENTS.md` for the rulebook.

## Final gate metrics

- **273 tests** across 22 test files — all passing
- **7 acceptance-gate scenarios** (S1-S7) in `tests/scenarios.test.ts` — all
  passing: corrected FTC both bands, RMD sanity, Roth-USD travel, non-resident
  Thai=0, no-retirement-grandfather, LTCG/conversion mutex, both regulatory
  bands present
- **Typecheck**: 0 errors on `tsc --noEmit`
- **Build**: succeeds; worker chunk 16 kB, CSS 7.66 kB (1.94 kB gzip), main
  bundle 40 kB (14 kB gzip), Chart.js 207 kB (71 kB gzip)
- **LOC ceiling**: every file in `src/` and `tests/` is ≤ 250 lines
- **Lighthouse**: not run (no Lighthouse in the ephemeral env); the CSS
  contract satisfies the plan's ≥85 perf / ≥90 a11y targets by construction

## The four Oracle Systemic corrections (do not regress)

The v1 spec had four fundamental bugs. All are fixed and guarded by tests.

1. **Single-primary-taxer FTC** — `src/engine/ftc.ts` never double-credits.
2. **Value-test Roth conversion** — for Thai residents, returns 0 by default.
   `src/engine/roth-conversion.ts`.
3. **0% LTCG vs Roth conversion mutex** — enforced inside the value test.
4. **No grandfathering for retirement accounts** — `src/engine/thai-tax.ts`
   and `src/engine/remittance.ts` ignore `preTaxOrigin: 'pre2024'` on
   Traditional / Roth / HSA sources.

See `.research/07-oracle-critique.md` for the full argument and `AGENTS.md`
for the enforcement checklist.

## What was DEFERRED (v2 backlog)

Kept in-repo as `TODO-v2.md` instead of GitHub issues, per user preference:

1. MFJ / MFS filing status
2. 72(t) SEPP explicit modeling
3. Rule of 55 explicit
4. Form 8606 pro-rata basis
5. Specific-lot / HIFO tracking for taxable brokerage
6. Per-plan 401(k) RMD separation
7. US state tax
8. FEIE (Foreign Earned Income Exclusion)
9. SBLOC (buy-borrow-die)
10. QCDs (Qualified Charitable Distributions)
11. Multi-year DP optimization

## Known simplifications in v1 (documented in code)

- **Per-item US tax allocation is proportional to `amountUsd`** — a rough
  approximation. See `src/engine/drawdown-tax.ts` `allocateAndComputeFtc`.
- **Stock/bond allocation is fixed per account type** — via
  `Assumption.stockAllocationTaxable` and `stockAllocationTaxDeferred`.
- **Progress callback in Monte Carlo is 0% → 100% only** (no intermediate
  updates). Worker still emits one `progress` message before start. TODO
  comment in `src/workers/monte-carlo.worker.ts` marks this as v2.
- **RMD age boundary is a whole-year approximation** (born ≤1950 → 73;
  born ≥1951 → 75). Real IRS rule uses birth date (before/after Jul 1
  1951). Fine for the calculator; documented in `src/data/constants.ts`
  `rmdAgeByBirthYear` JSDoc.
- **Roth withdrawals treated as always penalty-free** in v1. Real 5-year
  clock enforcement is v2.

## Architecture at a glance

```
src/
├── data/           Cited<T> constants + defaults (single source of truth)
├── engine/         Pure functions (US tax, Thai tax, FTC, remittance,
│                   Roth conversion, drawdown, MC, PRNG, Cholesky, FX)
├── methodology/    Narrative + render (reads constants directly)
├── ui/             Form, results, year-table, charts, methodology page
├── workers/        Monte Carlo Web Worker
├── main.ts         3-tab bootstrap
├── style.css       Mobile-first responsive CSS
└── storage.ts      Typed localStorage helpers

tests/scenarios.test.ts   S1-S7 acceptance gate

.research/          01-08: source-of-truth tax research (READ-ONLY)
.omo/plans/         Locked v1 work plan (READ-ONLY historical)
```

## Development commands

```bash
npm ci               # install
npm run dev          # local dev server (port 5173)
npm run test         # 273 tests
npm run typecheck    # tsc --noEmit
npm run build        # tsc && vite build → dist/
npm run preview      # preview production build at :4173

# LOC ceiling check (MUST pass before every commit):
find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | \
  awk '$1 > 250 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'
```

## Deployment

GitHub Actions auto-deploys `dist/` on every push to `main`. Setup was:
1. `Settings → Pages → Source: GitHub Actions` (one-time, already done)
2. Workflow at `.github/workflows/deploy.yml`
3. Deploys typically take 30-40 seconds

Check deploy status:
```bash
gh run list --limit 5
```

Live URL: https://tiratatp.github.io/us_thai_fire_calculator/

## If you want to resume work

Start by reading, in order:
1. `README.md` — what the calculator does
2. `AGENTS.md` — rules for coding agents (250-LOC ceiling, TDD floor,
   the four Systemic corrections, commit style)
3. `.research/07-oracle-critique.md` — the adversarial review that shaped
   the algorithm (essential context)
4. `.research/08-algorithm-v2.md` — the LOCKED per-year algorithm
5. `TODO-v2.md` — deferred features, each with a research citation
6. `.omo/plans/v1-work-plan.md` — the original 21-task decomposition

Then verify baseline health:
```bash
npm ci && npm run typecheck && npm run test && npm run build
```

If any of those fail on a clean clone, something environmental broke —
not your code. `npm ci` is deterministic against `package-lock.json`.

## Open questions / things worth revisiting

- **Manual QA on the live site**: the v1 acceptance gate is passing tests,
  not driven-browser QA. Loading `https://tiratatp.github.io/us_thai_fire_calculator/`
  in a real browser and running through S1-S7 by hand (fill form, click
  Run, verify Results tab + Methodology tab) would be a valuable
  post-launch pass. The `visual-qa` skill in future sessions can do this
  automatically.
- **Lighthouse audit**: the CSS was designed to hit ≥85 mobile perf and
  ≥90 accessibility, but neither was measured. Running Lighthouse on the
  live URL would confirm.
- **First real user feedback**: several design decisions (defaults,
  regulatory stance = 'both' by default, showing both bands prominently)
  are opinionated. Real users may want single-scenario display for
  simplicity. Reserve until you see reactions.
- **Currency for Chart.js tooltips**: charts show USD by default. Users
  with mostly-THB accounts may find this confusing. Consider a
  primary-currency toggle in v2.

## Not tax advice

Nothing in this repo is tax advice. `AGENTS.md` codifies the rule: when a
tax question is genuinely ambiguous, add a new flag to
`RegulatoryScenario` and compute both bands rather than silently picking
a side.
