# AGENTS.md

Guidance for coding agents working on this repo. Read this before making changes.

## What this is

A static-site FIRE (Financial Independence, Retire Early) calculator for US
citizens who are ALSO Thai citizens retiring in Thailand as Thai tax residents.
Client-side only. Deployed to GitHub Pages. Vite vanilla-TypeScript + Chart.js
+ Vitest. See `README.md` for user-facing description and `.research/01-08`
for the source-of-truth tax research.

## Core invariants (never break these)

1. **500-LOC file ceiling.** Every file in `src/` and `tests/` MUST be ≤ 500
   lines. Ceiling was relaxed from 250 → 500 in commit `3c4f684` after the
   drawdown was split into 3 files; do NOT re-tighten without user approval.
   If you're about to breach, split by concern first. Check with:
   ```bash
   find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | \
     awk '$1 > 500 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'
   ```

2. **TypeScript strict + `noUncheckedIndexedAccess`.** No `any`, no
   `@ts-ignore`, no `as unknown as X`. See `tsconfig.json`. If array
   indexing complains, use `array[i]!` only when you can PROVE the index
   is in bounds — otherwise handle `undefined` explicitly.

3. **TDD floor.** Every rule change / algorithm change / bug fix gets a
   failing test FIRST, then the impl. Never write production code before
   its test exists and fails for the right reason.

4. **Single source of truth for constants.** Every numeric tax constant
   lives in `src/data/constants.ts` wrapped in `Cited<T>` with sourceUrl,
   sourceName, retrievedDate. The methodology page renders FROM these
   constants — do not duplicate numbers into narrative strings.

5. **Comments are almost always wrong.** Only necessary comments are
   allowed: complex algorithms, security-related notes, non-obvious
   arithmetic, or intentional overrides of caller-supplied flags (e.g.
   Systemic #4 in `remittance.ts`). Otherwise refactor for
   self-documenting code.

## Four Systemic corrections (never regress these)

Oracle reviewed the v1 algorithm and found 4 fundamental bugs. The engine
now corrects all of them. Guard tests exist in the engine test files and
in `tests/scenarios.test.ts`. Do not "simplify away" any of these.

- **Systemic #1 — single-primary-taxer FTC.** For each remittance item,
  exactly ONE country is the primary taxer; the other grants a limited
  credit. NEVER double-credit. See `src/engine/ftc.ts` and Oracle D3
  worked example in `.research/07-oracle-critique.md`.

- **Systemic #2 — value-test Roth conversion.** For a Thai resident,
  Roth conversion returns 0 by default. Do NOT "fill 12%" — that costs
  US tax with zero Thai benefit. See `src/engine/roth-conversion.ts`.

- **Systemic #3 — 0% LTCG harvest vs Roth conversion mutex.** Both use
  the same 12%-bracket space. Enforce mutual exclusion. See
  `valueTestRothConversion`.

- **Systemic #4 — no grandfathering for retirement accounts.**
  Paw 162/2566 pre-2024 grandfathering applies to Cash and Taxable
  Brokerage ONLY. `thai-tax.ts` and `remittance.ts` must ignore any
  `preTaxOrigin: 'pre2024'` flag injected onto a retirement source.

## Architecture

```
src/
├── data/           Cited<T> constants + default assumptions
├── engine/         Pure functions (US tax, Thai tax, FTC, remittance,
│                   Roth conversion, RMD, drawdown [3 files], Monte Carlo,
│                   PRNG, Cholesky, FX, inflation, funding-sources)
├── methodology/    5 reader-task content groups + composer + renderer:
│                   content-read-first / content-us-rules / content-thai-rules /
│                   content-interaction / content-simulation → content.ts → render.ts
│                   (all read constants directly)
├── ui/             Form (form.ts + form-account.ts + form-schema.ts + format.ts),
│                   results, year-by-year table, charts, navigate (hash-based),
│                   methodology-page (mounts References tab),
│                   drawdown-page, gap-year-page (+ gap-year-mechanics),
│                   monte-carlo-page
├── workers/        Monte Carlo Web Worker
├── main.ts         6-tab bootstrap (Inputs / Results / Monte Carlo /
│                   Drawdown / Gap year / References)
├── style.css       Mobile-first responsive CSS
├── types.ts        Shared TypeScript types
└── storage.ts      Typed localStorage helpers

tests/              End-to-end scenarios (S1-S7 acceptance gate) + user scenarios
.research/          01-08: source-of-truth tax research (DO NOT DELETE)
.omo/plans/         Locked work plans — v1 + subsequent feature plans (DO NOT DELETE)
```

The public tab labelled "References" is the same page other docs still call
"the methodology page" — same file (`ui/methodology-page.ts`), same content
group system in `src/methodology/`. Anchor deep links use the
`#references/<anchor>` hash form and are handled by `ui/navigate.ts`.

## Verify commands (run before every commit)

```bash
npm run typecheck   # tsc --noEmit; must exit 0
npm run test        # vitest run; must exit 0 with all tests green
npm run build       # tsc && vite build; must exit 0

# LOC ceiling
   find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | \
     awk '$1 > 500 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'
   ```

If ANY of these fail, do not commit. Fix, then re-run.

## Commit style

Conventional Commits, small atomic units. Test and implementation land in
the SAME commit. See `git log --oneline` for the established pattern.

- `feat(engine): <what>` — new pure function
- `feat(ui): <what>` — new UI piece
- `feat(app): <what>` — main.ts / index.html changes
- `feat(data): <what>` — constants / defaults
- `feat(methodology): <what>` — methodology page
- `feat(worker): <what>` — worker
- `test(<scope>): <what>` — tests-only additions
- `refactor(<scope>): <what>` — restructure without behavior change
- `docs: <what>` — README, LICENSE, TODO-v2, this file
- `chore: <what>` — tooling, gitignore, package lock
- `ci: <what>` — GitHub Actions

Rules:
- Never `git push --force`, never amend a pushed commit, never
  `--no-verify`.
- Never commit `dist/`, `node_modules/`, or `.omo/run-continuation/`.
- Push only when the user explicitly asks.

## Regulatory scenarios (both bands are computed)

Four regulatory uncertainties are modeled as boolean flags on
`RegulatoryScenario`. The engine runs the entire Monte Carlo TWICE — once
optimistic, once pessimistic — and displays both. Never collapse to a
single scenario without user opt-in via `regulatoryStance: 'optimistic' | 'pessimistic' | 'both'`.

- `rothTaxedByThailand` — pessimistic: true (Thailand doesn't recognize Roth)
- `treatyResourcesUsSourcePensions` — optimistic: true (Art. 25 re-sources)
- `thaiPensionDeductionApplies` — optimistic: true (50% cap 100k THB)
- `niitCreditableAgainstThai` — optimistic: true (contested; *Christensen*)

## When adding a new tax rule or constant

1. Add the numeric value to `src/data/constants.ts` wrapped in `Cited<T>`
   with a real https `sourceUrl` (IRS, rd.go.th, treaty text, or a
   reputable expert firm).
2. Add a monotonicity / sanity test to `src/data/constants.*.test.ts`.
3. If the rule affects methodology narrative, update
   `src/methodology/content-*.ts` and reference the anchor from any
   year-table column that shows the rule's effect.
4. If the rule is UNSETTLED, add it to the pessimistic scenario in
   `DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC` and to the
   `roth-uncertainty` methodology section.

## When adding a UI piece

1. Prefer plain HTML strings from `renderXxx(container, inputs)` mount
   functions — no framework.
2. Every numeric column header MUST link to a methodology anchor via
   `columnAnchorMap()` using the `#references/<anchor>` deep-link form.
   The test in `src/ui/year-table.test.ts` will fail if you reference an
   anchor that doesn't exist in `methodologyAnchorSet()` (drawn from the
   composed content groups in `src/methodology/content.ts`).
3. Escape user-facing strings via a local `esc()` helper before
   inserting into `innerHTML`.
4. CSS custom properties live in `src/style.css` — reuse them, don't
   hardcode colors.
5. If you add a new top-level tab, update the `TabId` union in
   `src/ui/navigate.ts`, the tab button in `index.html`, the panel
   `<section id="…-tab">`, the hash regex in `main.ts` `handleHash()`,
   and the mount call in `bootstrap()`. All five MUST agree.

## When touching the drawdown algorithm

The drawdown is split across three files (originally to respect the old
250-LOC ceiling; the split is still the right separation of concerns and
should be preserved even under the 500-LOC ceiling):
- `src/engine/drawdown.ts` — orchestrator (Steps 0-11)
- `src/engine/drawdown-draws.ts` — mutable-account helpers + THB/USD draws + tax payment
- `src/engine/drawdown-tax.ts` — US/Thai tax compute + per-item FTC allocation

Sequence of steps per year is FIXED by the algorithm doc
(`.research/08-algorithm-v2.md` Steps 0-11). Do NOT reorder. In
particular:
- RMD executes BEFORE Roth conversion (same year).
- USD-only spending (travel) draws Roth BEFORE Traditional (Roth is
  US-tax-free AND no remittance → Thai=0 — "Roth's shining moment").
- Roth conversion runs its value test AFTER LTCG harvest (mutex).
- Tax computation uses corrected FTC (T7); no double-crediting.

## Skills reminder

Match the task's true nature:
- Frontend/UI/visual work → `visual-engineering` category with `frontend`
  skill. Never `quick` or `unspecified-*`.
- Complex algorithm/logic → `ultrabrain` category with `programming` skill.
- Docs/prose → `writing` category.
- Simple config/file moves → `quick` category.

## Deploy

GitHub Actions auto-deploys `dist/` to Pages on push to `main`. See
`.github/workflows/deploy.yml`. Repo Settings → Pages → Source must be
"GitHub Actions" (one-time setup).

Live at: https://tiratatp.github.io/us_thai_fire_calculator/

## Not tax advice

Nothing in this repo is tax advice. When touching any tax rule, if the
correct behavior is genuinely unclear, add the case to
`DEFAULT_REGULATORY_SCENARIO_*` as a new uncertainty flag rather than
silently picking a side.
