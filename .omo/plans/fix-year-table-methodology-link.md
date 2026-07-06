# Plan: Fix year-by-year table → methodology deep-linking

## TL;DR (For humans)

**Bug:** Click a column header ("US tax", "RMD", "Thai tax", …) in the year-by-year table — nothing works. The link targets `methodology.html#anchor`, but this app is a single-page app and no such file exists. On GitHub Pages you get a 404.

**Fix:** Rewrite headers as SPA-aware links (`href="#methodology/<id>"`) that intercept the click, switch to the Methodology tab, smooth-scroll to the section, and update `location.hash`. Also honor `#methodology/<id>` hashes on page load and on `hashchange` so deep links are shareable.

**How:** One tiny new module (`src/ui/navigate.ts`) owning `switchTab` + `deepLinkToMethodology`; `year-table.ts` emits SPA links + delegates one click handler; `main.ts` invokes the deep-link handler at boot and on `hashchange`. Every change is TDD-first (jsdom).

**Files touched (production):** `src/ui/year-table.ts`, `src/main.ts`, and new `src/ui/navigate.ts`. Tests: `year-table.test.ts`, new `src/ui/navigate.test.ts`, new bootstrap test in `src/main.test.ts` (or extend existing).

**Success:** Clicking a year-table header switches the tab, scrolls to the anchor, updates the URL to `#methodology/<id>`, and reloading that URL lands the user on the same anchor.

---

## Scope

### In scope

- Fix the broken `methodology.html#<anchor>` hrefs emitted by the year-by-year table (`src/ui/year-table.ts`).
- Make column-header clicks: switch to Methodology tab, smooth-scroll to the section, update `location.hash`.
- Support deep links: opening `index.html#methodology/<id>` and `hashchange` events must open the Methodology tab and scroll to the target section.
- Add regression tests that would have caught the bug (href format + click behavior + deep-link handler).

### Out of scope

- No changes to `columnAnchorMap()` keys or existing anchor IDs.
- No changes to methodology content or section IDs.
- No changes to Results / Inputs tab UI.
- No changes to the SPA routing model beyond the `#methodology/<id>` hash convention.
- No changes to Chart.js, worker, or engine code.
- Not adding a full router; a single hash pattern is enough.

### Must-NOT-have

- Must NOT introduce a circular import (`year-table.ts` must NOT import from `main.ts`).
- Must NOT break the existing `mountMethodologyPage` internal smooth-scroll handler (clicks on TOC links inside the methodology tab must keep working).
- Must NOT change `href` targets for citation `<a href="https://...">` links or TOC `<a href="#id">` links inside the methodology page itself.
- Must NOT emit `href="methodology.html#…"` from ANY file after this change (grep guard in the final wave).
- Must NOT breach the 250-LOC ceiling on any changed/new file.

## Verification strategy

- **TDD floor:** every behavior change has a failing test committed first, then the impl in the same or next commit atomically.
- **jsdom** for DOM tests (already the project convention, see existing `// @vitest-environment jsdom` comments).
- **Regression assertion:** a new test asserts `<a>` href in year-table headers matches `/^#methodology\//` and NEVER `methodology.html`.
- **Behavior assertions:** simulate a click on a header, confirm `location.hash` updates and the Methodology `<section>` loses the `hidden` class and its target subsection is queried.
- **Grep guard** in Final verification wave: `grep -rn "methodology\.html" src/` must return zero matches.
- **All existing tests** (273 currently) must remain green.
- **Manual QA at end:** `npm run dev`, click each column header, verify tab switches + scrolls + hash updates; then hard-reload with `#methodology/us-brackets-2026` in the URL and verify.

## Execution strategy

Sequential (small blast radius, single feature). Every todo is atomic and lands with its test in one commit. Test-first for behavior changes.

1. **Create `src/ui/navigate.ts`** (new module) that exports `switchTab(target)` and `deepLinkToMethodology(id)`. Cover with tests before other files depend on it.
2. **Refactor `main.ts`** to import `switchTab` from `navigate.ts` (drop the local copy); add a boot-time `hashchange` handler + initial-hash handler that call `deepLinkToMethodology`.
3. **Update `year-table.ts`** to emit `href="#methodology/<id>"` and attach a delegated click handler that calls `deepLinkToMethodology`.
4. **Extend tests** for year-table href format + click behavior + main.ts deep-link handling.
5. **Final wave:** grep guard, LOC guard, typecheck, full test, build.

## Todos

### T1. Create failing test file `src/ui/navigate.test.ts` ✅ VERIFIED - test fails with module-not-found, three test cases, setupDOM helper

- WHERE: new file `src/ui/navigate.test.ts`
- WHY: lock behavior of the new navigation module before implementing it (TDD floor).
- HOW: `// @vitest-environment jsdom`. Stand up the tab DOM structure from `index.html` (buttons `.tab[data-tab=inputs|results|methodology]`, sections `.tab-panel#<name>-tab` with `hidden` class as needed). Import `switchTab` and `deepLinkToMethodology` (which don't exist yet — test MUST fail on import).
- Assert cases:
  1. `switchTab('methodology')` removes `hidden` from `#methodology-tab`, adds `hidden` to `#inputs-tab` and `#results-tab`, and sets `aria-selected="true"` on the methodology tab button.
  2. `deepLinkToMethodology('us-brackets-2026')`:
     - calls the tab switch (methodology section becomes visible),
     - queries `#us-brackets-2026` inside `#methodology-tab` and calls `scrollIntoView` on it (spy via `Element.prototype.scrollIntoView`).
  3. `deepLinkToMethodology('nonexistent-anchor')` does NOT throw and still switches the tab.
- References: `index.html:14-33`, `src/main.ts:20-30`.
- QA: `npx vitest run src/ui/navigate.test.ts` — expect failure with "module not found" or missing exports.
- Evidence: capture the failing output to the commit body.
- Commit: `test(ui): add failing tests for navigate module (switchTab + deepLinkToMethodology)`.

### T2. Implement `src/ui/navigate.ts` to pass T1 ✅ VERIFIED - 3/3 tests pass, typecheck clean, 284/284 full suite

- WHERE: new file `src/ui/navigate.ts`.
- WHY: consolidate SPA navigation so `year-table.ts` and `main.ts` share one code path (no circular import).
- HOW:
  ```ts
  export type TabId = 'inputs' | 'results' | 'methodology';

  export function switchTab(target: TabId): void {
    document.querySelectorAll<HTMLElement>('.tab').forEach((el) => {
      const active = el.dataset.tab === target;
      el.classList.toggle('active', active);
      el.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll<HTMLElement>('.tab-panel').forEach((el) => {
      const active = el.id === `${target}-tab`;
      el.classList.toggle('hidden', !active);
    });
  }

  export function deepLinkToMethodology(id: string): void {
    switchTab('methodology');
    const container = document.querySelector<HTMLElement>('#methodology-tab');
    if (!container) return;
    // CSS.escape guards against ids containing CSS-special chars.
    const el = container.querySelector(`#${CSS.escape(id)}`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  ```
- References: verbatim `switchTab` currently at `src/main.ts:20-30`; smooth-scroll pattern already at `src/ui/methodology-page.ts:18-21`.
- Must NOT: no `any`, no `@ts-ignore`, no imports from `main.ts`.
- QA: `npx vitest run src/ui/navigate.test.ts` — expect ALL green. Then `npm run typecheck`.
- Evidence: green vitest output.
- Commit: `feat(ui): add navigate module for SPA tab switching and deep linking`.

### T3. Refactor `main.ts` to use `navigate.ts` + add hash handler (test-first) ✅ VERIFIED - 3/3 tests, 287/287 full suite, typecheck clean

- WHERE: extend `src/ui/methodology-page.test.ts` OR add `src/main.test.ts`. Choose `src/main.test.ts` (new, tiny) so `main.ts` gets direct coverage.
- WHY: lock deep-link behavior at bootstrap and on `hashchange`.
- HOW (test):
  - `// @vitest-environment jsdom`.
  - Build a minimal DOM matching `index.html` (tabs + `#methodology-tab` containing a section with `id="ftc-corrected"`).
  - Set `location.hash = '#methodology/ftc-corrected'` before calling `bootstrap()` — assert methodology tab becomes visible and `scrollIntoView` is spied.
  - Fire a `hashchange` event with `location.hash = '#methodology/us-brackets-2026'` — assert scroll again.
  - Assert an unrelated hash like `#results` does NOT switch the tab automatically.
- HOW (impl):
  - `import { switchTab, deepLinkToMethodology } from './ui/navigate.js';` in `main.ts`.
  - Delete the local `switchTab` in `main.ts` (currently `main.ts:20-30`).
  - In `bootstrap()`, after mounts, add:
    ```ts
    function handleHash(): void {
      const m = /^#methodology\/(.+)$/.exec(location.hash);
      if (m && m[1]) deepLinkToMethodology(m[1]);
    }
    window.addEventListener('hashchange', handleHash);
    handleHash();
    ```
- References: `src/main.ts:20-30`, `src/main.ts:136-158`.
- Must NOT: exceed 250 LOC in `main.ts` (currently 164; removing 11 + adding ~10 → ~163).
- QA: `npx vitest run src/main.test.ts` all green; `npx vitest run` full suite green; `npm run typecheck` clean.
- Evidence: vitest + typecheck output.
- Commit: `feat(app): honor #methodology/<id> deep links at boot and on hashchange`.

### T4. Extend `src/ui/year-table.test.ts` with failing regression tests ✅ VERIFIED - 3 new tests FAIL (TDD-fail-first), 287 existing pass, typecheck clean

- WHERE: `src/ui/year-table.test.ts` (append; keep file ≤ 250 LOC — currently 112, room to grow).
- WHY: lock the exact href format and click behavior so this bug can never regress silently.
- HOW: add a new `describe('year-table methodology links', …)` block asserting:
  1. Rendered `<th> <a>` headers have `href` matching `/^#methodology\//` for every entry in `columnAnchorMap()`.
  2. NO `<a>` in the year-table has `href` containing `"methodology.html"`.
  3. Simulating a `click` on a mapped header (e.g. the "US tax" header):
     - `preventDefault` prevents the default anchor jump,
     - `location.hash` becomes `#methodology/us-brackets-2026`,
     - `#methodology-tab` no longer has class `hidden`.
- HOW to test click: mount full DOM (tabs + panels), call `renderYearTable`, `container.querySelector('a[href="#methodology/us-brackets-2026"]')`, dispatch a `new MouseEvent('click', {bubbles: true, cancelable: true})`.
- References: `src/ui/year-table.ts:74-80`; `src/ui/year-table.test.ts:1-14`.
- QA: `npx vitest run src/ui/year-table.test.ts` — expect the new assertions to FAIL for the right reason (href still `methodology.html#…`).
- Evidence: failing output captured.
- Commit: `test(ui): add failing regression tests for year-table methodology deep links`.

### T5. Fix `src/ui/year-table.ts` header rendering + click delegation ✅ VERIFIED - 9/9 tests, typecheck clean, 290/290 full suite

- WHERE: `src/ui/year-table.ts` (currently 97 LOC — plenty of headroom).
- WHY: make T4 pass; this is the actual bug fix.
- HOW:
  - Add `import { deepLinkToMethodology } from './navigate.js';` at top.
  - Replace the `thead` map's link line:
    ```ts
    return `<th><a href="#methodology/${esc(anchor)}" data-methodology-anchor="${esc(anchor)}">${esc(h)}</a></th>`;
    ```
  - After `container.innerHTML = …`, attach a single delegated click handler:
    ```ts
    container.addEventListener('click', (e) => {
      const t = e.target instanceof HTMLElement
        ? e.target.closest<HTMLElement>('a[data-methodology-anchor]')
        : null;
      if (!t) return;
      e.preventDefault();
      const id = t.dataset.methodologyAnchor;
      if (!id) return;
      history.pushState(null, '', `#methodology/${id}`);
      deepLinkToMethodology(id);
    });
    ```
  - Rationale for `history.pushState` vs `location.hash =`: pushState avoids a redundant `hashchange` roundtrip (we're calling `deepLinkToMethodology` directly) while still updating the URL for bookmarking. Preserves back-button behavior.
- References: `src/ui/year-table.ts:74-96`.
- Must NOT: keep `methodology.html` anywhere in the file; must NOT introduce `any`; must NOT exceed 250 LOC.
- QA: `npx vitest run src/ui/year-table.test.ts` all green; `npx vitest run` full suite green; `npm run typecheck` clean.
- Evidence: green vitest + typecheck.
- Commit: `fix(ui): year-table headers link to methodology via SPA hash, not dead methodology.html`.

### T6. LOC + build guards ✅ VERIFIED - LOC clean, typecheck 0, 290/290 tests, build success

- WHERE: repo root.
- WHY: enforce the 250-LOC ceiling and confirm the production build still succeeds.
- HOW:
  ```bash
  find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | \
    awk '$1 > 250 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'
  npm run typecheck
  npm run test
  npm run build
  ```
- QA: all four commands must exit 0.
- Evidence: paste each exit line into commit body if any file needs a splitting commit; otherwise no new commit.
- Commit: (usually none — verification only). If any file breaches 250, split by concern in a preceding `refactor(ui): split …` commit.

## Final verification wave

Run these AFTER T1–T6. Delegate F1–F4 in parallel to independent agents when convenient; otherwise execute serially with evidence captured.

- **F1. Plan compliance audit** (subagent_type=oracle): ✅ PASS — read `.omo/plans/fix-year-table-methodology-link.md` and the diff; confirmed every "In scope" item done, every "Must-NOT-have" holds, no surprise scope. Zero `methodology.html#…` hrefs in any production file.
- **F2. Code quality review** (subagent_type=oracle): ✅ PASS — read `src/ui/results.ts`, `src/ui/year-table.ts`, `src/ui/navigate.ts`, `src/main.ts`; confirmed no `any`, no `@ts-ignore`, `noUncheckedIndexedAccess` respected with provable `!` guards, no circular imports, no unnecessary comments.
- **F3. Real manual QA** (unspecified-high, hands-on): ✅ PASS — all 8 headers tested via Playwright: clicking any header switches to Methodology tab, updates hash to `#methodology/<id>`, and deep-link reload works correctly.
- **F4. Scope fidelity + grep guards**: ✅ PASS — `grep -rn "methodology\.html"` returns only test assertion strings (negative assertions); `grep -rn 'href="methodology'` returns OK; LOC check clean (all files ≤ 250).

All four must PASS. If any FAIL, STOP and open a follow-up plan.

## Commit strategy

Atomic conventional commits, one concern each, test-and-impl paired:

1. `test(ui): add failing tests for navigate module (switchTab + deepLinkToMethodology)` (T1)
2. `feat(ui): add navigate module for SPA tab switching and deep linking` (T2)
3. `feat(app): honor #methodology/<id> deep links at boot and on hashchange` (T3, includes its own test)
4. `test(ui): add failing regression tests for year-table methodology deep links` (T4)
5. `fix(ui): year-table headers link to methodology via SPA hash, not dead methodology.html` (T5)

Rules (from AGENTS.md):
- No `git push --force`, no amending pushed commits, no `--no-verify`.
- Don't commit `dist/`, `node_modules/`, `.omo/run-continuation/`.
- Push only when the user explicitly asks.

## Success criteria

1. Clicking any of the 8 mapped column headers in the year-by-year table:
   - switches the visible tab to Methodology,
   - smooth-scrolls to the correct anchor,
   - updates `location.hash` to `#methodology/<anchor>`.
2. Loading `index.html#methodology/<anchor>` from a cold reload lands the user on the correct section with the Methodology tab visible.
3. `grep -rn "methodology\.html" src/ tests/ index.html` returns no matches.
4. `npm run typecheck` exits 0.
5. `npm run test` exits 0 with ALL prior tests still green PLUS the new regression tests.
6. `npm run build` exits 0.
7. Every changed/new file is ≤ 250 lines.
8. No new `any`, `@ts-ignore`, or `as unknown as X`.
