# fix-drawdown-text - Work Plan

## TL;DR (For humans)

**What you'll get:** 
- The hardcoded amount "($900k of $1.275M)" will be removed from the Drawdown tab since the actual amounts depend on user inputs.
- Acronyms (RMD, FTC, LTCG) used in the Drawdown tab will feature HTML5 hover definitions.
- The section "Why Thai Tax Appears Only in Certain Years" will be moved from the Drawdown tab to the References (Methodology) tab, where it belongs.

**Why this approach:** 
Improves clarity and accuracy by removing hardcoded assumptions from the UI text and standardizing acronym definitions. It also keeps the Drawdown tab concise by relocating lengthy explanations to the References tab.

**Effort:** Trivial
**Risk:** Low

---

## Scope
### Must have
1. Modify `src/ui/drawdown-page.ts` to:
   - Remove the hardcoded `($900k of $1.275M)` text.
   - Add `<abbr title="Required Minimum Distribution">RMD</abbr>` around "RMD" (or RMDs).
   - Add `<abbr title="Foreign Tax Credit">FTC</abbr>` around "FTC".
   - Add `<abbr title="Long-Term Capital Gains">LTCG</abbr>` around "LTCG".
   - Remove the `<h2>Why Thai Tax Appears Only in Certain Years</h2>` section and its paragraphs.
2. Modify `src/methodology/content-algo.ts` (or equivalent) to add a new methodology section containing the removed "Why Thai Tax Appears Only in Certain Years" text.

### Must NOT have
- Do not modify the underlying computation logic.
- Do not change any constants.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: ensure tests still pass, though these are just HTML/text changes.
- Evidence: `npm run test`
- Commands: `npm run test`

## Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Update text & move section | 0 | F1 | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Update text & move section
  What to do: In `src/ui/drawdown-page.ts`, remove the hardcoded basis amounts, wrap RMD, FTC, and LTCG in `<abbr>` tags, and delete the "Why Thai Tax Appears Only in Certain Years" section. In `src/methodology/content-algo.ts`, add that deleted section to `ALGO_SECTIONS` so it appears in the References tab.
  Commit: `feat(ui): refine drawdown tab text and move explanation to references`

## Final verification wave
> All reviewers APPROVED after independent verification.
- [x] F1. Plan compliance audit — VERDICT: APPROVE (all 8 requirements verified)
- [x] F2. Code quality review — VERDICT: APPROVE (clean code, no issues)
- [x] F3. Real manual QA — VERDICT: APPROVE (drawdown tab clean, references tab has section)
- [x] F4. Scope fidelity — VERDICT: APPROVE (only 3 expected files changed)