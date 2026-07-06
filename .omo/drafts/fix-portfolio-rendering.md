---
slug: fix-portfolio-rendering
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/fix-portfolio-rendering.md
approach: Update `YearTableInputs` to include the user's `accounts` definition, and separate the portfolio total into two columns: "Thai portfolio (THB)" and "US portfolio (USD)" in the UI table.
---

# Draft: fix-portfolio-rendering

## Components (topology ledger)
UI Table Split | Split portfolio value into Thai (THB) and US (USD) columns | active | `tests/ui/year-table.test.ts`

## Open assumptions (announced defaults)
- Fallback to `DEFAULT_USER_INPUTS` if restoring an older local storage `LastResult` that doesn't have `inputs`.

## Findings (cited - path:lines)
- `src/ui/year-table.ts:34-36`: `buildRow` sums `balancesByAccount` blindly.
- User requested splitting this into two columns: THB portfolio and USD portfolio to better see the remittance movement.
- `LastResult` in `main.ts` currently doesn't store `inputs`. We must store `inputs` so we know the currency of each account.

## Decisions (with rationale)
- Update `LastResult` in `main.ts` to include `inputs: UserInputs`.
- Update `YearTableInputs` to require `accounts: readonly Account[]`.
- Update `buildRow` to accept `accounts` and separate balances based on `account.currency`.
- Change table headers: replace "Portfolio total" with "Thai portfolio (THB)" and "US portfolio (USD)".

## Scope IN
- Splitting the year-table portfolio columns.
- Passing `accounts` to the renderer.
- Storing `inputs` in `LastResult`.

## Scope OUT (Must NOT have)
- Altering the drawdown algorithm itself.

## Approval gate
status: awaiting-approval
