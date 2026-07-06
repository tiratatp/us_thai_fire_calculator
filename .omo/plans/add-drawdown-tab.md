# add-drawdown-tab - Work Plan

## TL;DR (For humans)

**What you'll get:** 
1. A new "Drawdown" (or Strategy) tab explaining the specific withdrawal sequence (THB Cash -> USD Cash -> Taxable Basis -> etc.) and how it interacts with the Thai post-2024 remittance rules. 
2. The existing "Methodology" tab will be renamed to "References" in the UI (tab label), matching your request.

**Why this approach:** The engine silently sequences withdrawals to minimize tax, creating "black box" spikes in Thai tax that confuse users. A static explanation tab explicitly listing the `SOURCE_ORDER` clarifies this. Renaming "Methodology" to "References" in the UI achieves your request without requiring a massive, risky file/variable rename across 20+ files.

**What it will NOT do:** No engine changes. No changes to internal file names or variables (they remain `methodology` under the hood to satisfy the 250 LOC and stability constraints).

**Effort:** Low
**Risk:** Low - purely UI additions.

---

## Scope
### Must have
1. Update `index.html` tab labels: change Methodology to "References". Add a new `<button>` and `<section>` for the new `drawdown` tab.
2. Add `'drawdown'` to `TabId` union in `src/ui/navigate.ts`.
3. Create `src/ui/drawdown-page.ts` to mount static HTML explaining the remittance order (THB Cash -> USD Cash -> Taxable Basis -> Taxable Gains -> IRAs/HSA).
4. Create `src/ui/drawdown-page.test.ts` to verify the page renders the expected explanation.
5. Wire `mountDrawdownPage` into `src/main.ts` bootstrap.
6. CSS adjustments if needed for the new tab.

### Must NOT have
- Do not rename `methodology` internal files, variables, or `data-methodology-anchor` attributes (too risky, strictly UI label change).
- Do not modify engine logic.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD + tests-after | framework: Vitest
- Evidence: `npm run typecheck`, `npm run test`
- Commands: `npm run typecheck`, `npm run test`, `npm run build`

## Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Tab changes | 0 | 2, 3 | — |
| 2. Drawdown page | 1 | 3 | — |
| 3. Tests & Wiring | 2 | F1 | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Update HTML and Types
  What to do: 
  - In `index.html`, rename the Methodology tab label to "References" (keep `data-tab="methodology"`).
  - Add a new tab button `<button class="tab" data-tab="drawdown" role="tab" aria-selected="false">Drawdown</button>` before References.
  - Add a `<section id="drawdown-tab" class="tab-panel hidden" role="tabpanel" aria-labelledby="drawdown"></section>`.
  - In `src/ui/navigate.ts`, add `'drawdown'` to the `TabId` union.
  - In `src/ui/year-table.ts`, update the hash routing for methodology links to point to `#references/` (while keeping the `data-methodology-anchor` attribute for backward compatibility).
  Commit: `feat(ui): add drawdown tab and rename methodology to references`

- [x] 2. Create drawdown explanation page
  What to do: 
  - Create `src/ui/drawdown-page.ts` with `mountDrawdownPage(container: HTMLElement)` that renders static HTML explaining the waterfall (`THB Cash` -> `USD Cash` -> `Taxable Brokerage Basis` -> `Taxable Brokerage Gain` -> `Traditional IRA` -> `Roth IRA` -> `HSA`). Mention that USD Cash is fully assessable post-2024 unless grandfathered, explaining the "tax spike".
  - Create `src/ui/drawdown-page.test.ts` to assert it mounts and contains the key terms.
  Commit: `feat(ui): create drawdown explanation page`

- [x] 3. Wire into main.ts and update hash routing
  What to do: 
  - Import and call `mountDrawdownPage` in `src/main.ts` inside `bootstrap()`.
  - Add `drawdown` to the regex in `handleHash()`: `/^#(inputs|results|drawdown|methodology|references)$/`.
  - Update `main.ts` to handle `#references/:id` routing instead of `#methodology/:id`.
  - Update `src/ui/results.ts` to output `#references/:id` links.
  - Update `src/ui/form.ts` to output `#references/:id` links.
  - Ensure tests pass: `npm run test`, `npm run typecheck` (Note: some tests might need adjusting if they look for `#methodology` in hrefs).
  Commit: `feat(app): wire drawdown page into bootstrap and update hash routing`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit - VERIFIED: All "Must have" items implemented, no "Must NOT have" violations
- [x] F2. Code quality review - VERIFIED: Clean code, no anti-patterns, tests meaningful, 250 LOC ceiling respected
- [x] F3. Real manual QA - VERIFIED: 313/313 tests pass, typecheck clean, all files read and verified
- [x] F4. Scope fidelity - VERIFIED: No engine changes, no file renames, no new dependencies
