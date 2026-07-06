# fix-portfolio-rendering - Work Plan

## TL;DR (For humans)

**What you'll get:** The year-by-year table will show two distinct portfolio columns: "Thai portfolio (THB)" and "US portfolio (USD)".

**Why this approach:** Splitting the columns prevents the blind addition of THB and USD, fixing the UI rendering bug, while also allowing you to see exactly how your THB depletes and how USD is remitted over time. We will inject the account configurations into the table renderer to correctly identify which balance belongs to which currency.

**What it will NOT do:** 
- It will NOT alter the core drawdown Monte Carlo engine.

**Effort:** Quick
**Risk:** Low
**Decisions to sanity-check:** We will store the full UserInputs in local storage so that when you reload the page, the table knows which accounts are THB and which are USD.

Your next move: Approve this plan to execute the table split. Full execution detail follows below.

---

> TL;DR (machine): Quick effort, low risk. Split portfolio summing in year-table.ts into THB and USD columns.

## Scope
### Must have
- Two portfolio columns in `year-table.ts`: "Thai portfolio (THB)" and "US portfolio (USD)".
- `LastResult` must save `inputs` in `main.ts` so `accounts` map is available on reload.
- `YearTableInputs` must require `accounts`.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Must not change the logic in `src/engine/drawdown.ts` or `src/engine/monte-carlo.ts`.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD (modify tests in `src/ui/year-table.test.ts` first).
- Evidence: .omo/evidence/task-1-fix-portfolio-rendering.md

## Execution strategy
### Parallel execution waves

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | None | None | None |

## Todos
> Implementation + Test = ONE todo. Never separate.
- [x] 1. Split portfolio value into THB and USD in `year-table.ts`
  What to do / Must NOT do: 
  - Update `src/main.ts` `LastResult` to include `inputs?: UserInputs` (optional for backwards compat). In `renderAllResults`, pass `data.inputs?.accounts ?? DEFAULT_USER_INPUTS.accounts` to `renderYearTable`. Save `inputs` in `runSimulation`.
  - Update `YearTableInputs` in `src/ui/year-table.ts` to include `accounts: readonly Account[]`.
  - Update `buildRow` to compute `thbTotal` and `usdTotal` using `accounts` to map ID to currency.
  - Update headers to "Thai portfolio (THB)" and "US portfolio (USD)".
  - Update `columnAnchorMap` to map both to `monte-carlo-defaults`.
  - Fix `src/ui/year-table.test.ts` to expect two formatted outputs instead of one.
  Parallelization: Wave 1 | Blocked by: None | Blocks: None
  References (executor has NO interview context - be exhaustive): `src/ui/year-table.ts`, `src/ui/year-table.test.ts`, `src/main.ts`, `src/types.ts`.
  Acceptance criteria (agent-executable): `npm run test -- year-table.test.ts` passes. `npm run typecheck` passes.
  QA scenarios (name the exact tool + invocation): happy + failure, Evidence .omo/evidence/task-1-fix-portfolio-rendering.md
  Commit: Y | feat(ui): split portfolio value into THB and USD columns

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — APPROVED (inputs persistence fixed)
- [x] F2. Code quality review — APPROVED (redundant verdict tests removed, no `as any`)
- [x] F3. Real manual QA — APPROVED (table renders with separate THB/USD columns, console clean)
- [x] F4. Scope fidelity — APPROVED (no scope creep)

## Commit strategy
Atomic commit for the UI split and test update.

## Success criteria
The Year 0 portfolio shows separate Thai and US balances, accurately reflecting the non-FX-mingled values.
