# fix-references-tab - Work Plan

## TL;DR (For humans)

**What you'll get:** 
A fix for the References tab. Clicking the References tab will correctly switch the view and update the URL, and navigating directly to `#references` will open the correct tab.

**Why this approach:** 
In the previous update, we changed the TypeScript code to use `'references'` as the tab identifier but left `index.html` using `'methodology'` to minimize risk. This mismatch prevents the tab from opening. Updating the HTML attributes to match the TypeScript code fixes it.

**Effort:** Trivial
**Risk:** Low

---

## Scope
### Must have
1. Update `index.html` to change `data-tab="methodology"` to `data-tab="references"`.
2. Update `index.html` to change `id="methodology-tab"` to `id="references-tab"`.
3. Update `index.html` to change `aria-labelledby="methodology"` to `aria-labelledby="references"`.

### Must NOT have
- Do not rename any actual `.ts` files (e.g., `methodology-page.ts` stays as is).
- Do not modify the methodology content or engine.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: existing tests cover this (e.g. `navigate.test.ts`), just ensure they still pass.
- Evidence: `npm run test`
- Commands: `npm run test`

## Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Update index.html | 0 | F1 | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Update index.html tab attributes
  What to do: In `index.html`, find the Methodology tab button and section. Change `data-tab="methodology"` to `data-tab="references"`. Change `id="methodology-tab"` to `id="references-tab"`. Change `aria-labelledby="methodology"` to `aria-labelledby="references"`. Verify tests pass with `npm run test`.
  Commit: `fix(ui): update HTML attributes for references tab to fix navigation`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit
- [x] F2. Code quality review
- [x] F3. Real manual QA
- [x] F4. Scope fidelity