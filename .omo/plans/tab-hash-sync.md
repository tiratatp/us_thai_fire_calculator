# Plan: Sync top-level tabs with URL hash

## TL;DR (For humans)

**Goal:** When the user clicks the "Inputs" or "Results" tabs, the URL hash should update to `#inputs` or `#results`. Navigating directly to these hashes should automatically select the respective tab.

**How:** We'll update the `hashchange` handler in `src/main.ts` to also recognize `#inputs`, `#results`, and `#methodology` as top-level tab routes. We will also update the tab click listeners and the `runSimulation` function to push the new hash via `history.pushState`.

**Files touched:** `src/main.ts` and `src/main.test.ts`.

---

## Scope

### In scope
- Update `handleHash` in `src/main.ts` to recognize `#inputs`, `#results`, and `#methodology`.
- Update the tab click event listeners to push the new hash using `history.pushState(null, '', '#' + target)`.
- Update `runSimulation` to push `#results` to the hash before switching tabs.
- Update `main.test.ts` to assert that `#results` correctly switches to the results tab, and change the "unrelated hash" test to use `#foo`.

### Out of scope
- No changes to existing deep-link `#methodology/<id>` logic.
- No new routing library.

### Must-NOT-have
- Must NOT break the existing methodology deep links.
- Must NOT breach the 250-LOC ceiling on any changed/new file.

## Verification strategy
- **TDD:** Modify existing tests and add new assertions in `main.test.ts` first.
- **Manual QA:** Ensure clicking between tabs updates the URL, and reloading the page at `#results` preserves the active tab.

## Execution strategy
1. Update tests in `main.test.ts`.
2. Update the implementation in `main.ts`.
3. Final checks.

## Todos

1. [x] Update `src/main.test.ts` for new hash behavior
- WHERE: `src/main.test.ts`
- WHY: TDD floor for the new `#results` / `#inputs` behavior.
- HOW:
  - Change the "does not switch tab for unrelated hash after bootstrap" test from using `#results` to using an actually unrelated hash like `#foo`.
  - Add a new test: `it('switches to top-level tab on #results hash')`. Set `location.hash = '#results'; bootstrap();` and assert `resultsPanel` is visible (no `hidden` class).
- QA: `npx vitest run src/main.test.ts` (expect failure on new test).
- Commit: `test(app): expect #inputs and #results to switch tabs`

2. [x] Implement top-level hash sync in `src/main.ts`
- WHERE: `src/main.ts`
- WHY: Sync tabs with URL.
- HOW:
  - Update `handleHash()`:
    ```typescript
    function handleHash(): void {
      const hash = location.hash;
      const m = /^#methodology\/(.+)$/.exec(hash);
      if (m && m[1]) {
        deepLinkToMethodology(m[1]);
        return;
      }
      const tabMatch = /^#(inputs|results|methodology)$/.exec(hash);
      if (tabMatch && tabMatch[1]) {
        switchTab(tabMatch[1] as 'inputs' | 'results' | 'methodology');
      }
    }
    ```
  - In `bootstrap()`, inside the `.tab` click listener, add `history.pushState(null, '', '#' + target);` right before `switchTab(target)`.
  - In `runSimulation()`, add `history.pushState(null, '', '#results');` right before `switchTab('results')`.
- QA: `npm run typecheck && npm run test`
- Commit: `feat(app): sync top-level tabs with URL hash`

## Final verification wave
F1. [x] LOC and build guards: Run `npm run typecheck`, `npm run build`, and check LOC ceiling.

## Commit strategy
Atomic commits per step.
1. `test(app): expect #inputs and #results to switch tabs`
2. `feat(app): sync top-level tabs with URL hash`
