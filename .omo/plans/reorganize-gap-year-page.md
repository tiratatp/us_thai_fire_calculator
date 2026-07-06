# reorganize-gap-year-page — Work Plan

## TL;DR (For humans)

**What you'll get:**
The Gap-Year Strategy tab reorganized into 5 clearly-named top-level sections
(What is a gap year? / When does it make sense? / What to do during a gap year? /
Caveats / References) with a table of contents at the top and `<h3>` subheaders
for each existing sub-topic. The reader gets a scannable map, jump links, and a
top-to-bottom narrative flow (what → when → how → caveats → sources) instead of
the current 12-heading flat list.

**Why this approach:**
Content stays byte-identical — only the assembly order and heading levels change,
plus a new TOC block. All existing subsection anchors are preserved so external
links, bookmarks, and the year-table `#gap-year` hint keep working. The current
`gap-year-page.ts` + `gap-year-mechanics.ts` split is retained (both files stay
well under the 500-LOC ceiling). One atomic refactor commit.

**Effort:** Low (single-file reorganization + 5 `<h2>`→`<h3>` swaps in the fragments file)
**Risk:** Low (no behavior change, no engine touch, no anchor removal)

---

## Scope

### Must have

1. Add a `<h1 id="gap-year">` intro paragraph (unchanged content) followed by a
   `<nav class="toc">` with a flat one-level `<ul>` containing 5 anchor links:
   - `#gap-year-what` — What is a gap year?
   - `#gap-year-when` — When does it make sense?
   - `#gap-year-how` — What to do during a gap year?
   - `#gap-year-caveats` — Caveats
   - `#gap-year-references` — References
2. Wrap the "Three Tax Events Unlocked" block in a new `<section>` under
   `<h2 id="gap-year-what">What is a gap year?</h2>`. Demote the existing
   `<h2 id="gap-year-events">` to `<h3>` (keep the anchor).
3. Wrap the "$10,000 threshold" and "Age-65 cap" blocks in a new `<section>`
   under `<h2 id="gap-year-when">When does it make sense?</h2>`. Demote
   `<h2 id="gap-year-threshold">` and `<h2 id="gap-year-age-cap">` (inside
   `AGE_CAP_HTML`) to `<h3>` (keep anchors).
4. Wrap the Destinations table, Trad, Roth, LTCG, and Both blocks in a new
   `<section>` under `<h2 id="gap-year-how">What to do during a gap year?</h2>`.
   Order: Destinations first, then Trad, Roth, LTCG, Both. Demote
   `<h2 id="gap-year-destinations">` and the four fragment `<h2>` tags
   (`#gap-year-trad`, `#gap-year-roth`, `#gap-year-ltcg`, `#gap-year-both`) to
   `<h3>` (keep anchors).
5. Wrap the "Invariants" and "Not modeled" blocks in a new `<section>` under
   `<h2 id="gap-year-caveats">Caveats</h2>`. Demote `<h2 id="gap-year-invariants">`
   and `<h2 id="gap-year-not-modeled">` to `<h3>` (keep anchors).
6. Keep the existing References block under
   `<h2 id="gap-year-references">References</h2>` (unchanged).
7. Add one new jsdom test (`src/ui/gap-year-page.test.ts`) that mounts the page
   and asserts: (a) all five top-level anchors exist as `<h2>` elements,
   (b) all ten preserved subsection anchors still exist somewhere on the page,
   (c) each TOC link's `href` resolves to an element on the page.

### Must NOT have

- Do NOT change any prose, numeric constant, citation, or table cell.
- Do NOT delete or rename any existing anchor id — every one of the current
  `#gap-year-*` anchors survives.
- Do NOT touch `src/ui/year-table.ts`, `src/ui/year-table.gap-year.test.ts`,
  the engine, the methodology page, or the constants file.
- Do NOT collapse `gap-year-mechanics.ts` back into `gap-year-page.ts`.
- Do NOT add CSS beyond re-using existing custom properties (a minimal TOC
  can use plain `<nav><ul>` with no new class rules; if styling is needed use
  existing selectors).
- Do NOT introduce `any`, `@ts-ignore`, or non-null assertions on unproven
  indices.

## Verification strategy

> Zero human intervention — all verification is agent-executed.

- **Test decision:** tests-with-refactor. Add one new jsdom test file that
  locks the new structure (5 top-level h2s + all preserved anchors + TOC link
  resolution). Existing `year-table.gap-year.test.ts` must stay green
  unchanged.
- **Evidence:** `npm run test` output showing new file green and old count
  unchanged; `npm run typecheck` clean; `npm run build` clean; LOC-ceiling
  script clean.
- **Commands (run in order):**
  1. `npm run typecheck`
  2. `npm run test`
  3. `npm run build`
  4. `find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | awk '$1 > 500 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'`

## Dependency matrix

| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Demote fragment `<h2>`s in gap-year-mechanics.ts | — | 3 | 2 |
| 2. Write new jsdom structure test | — | 3 | 1 |
| 3. Rewrite gap-year-page.ts assembly + TOC + section wrappers | 1, 2 | 4 | — |
| 4. Run full verification wave | 3 | — | — |

## Todos

> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Demote `<h2>` to `<h3>` in the 5 mechanics fragments
  What to do: In `src/ui/gap-year-mechanics.ts`, change the opening `<h2 id="gap-year-age-cap">` to `<h3 id="gap-year-age-cap">` and its matching closing tag; do the same for `<h2 id="gap-year-trad">`, `<h2 id="gap-year-roth">`, `<h2 id="gap-year-ltcg">`, `<h2 id="gap-year-both">`. All ids are preserved. No other text changes. Verify `npm run typecheck` passes.
  Commit: folded into commit for todo 3 (atomic refactor).

- [x] 2. Add jsdom structure test `src/ui/gap-year-page.test.ts`
  What to do: Create a new test file that (a) imports `mountGapYearPage`, mounts it into a `document.createElement('div')`, (b) asserts `container.querySelectorAll('h2[id^="gap-year-"]')` yields exactly the 5 top-level ids `gap-year-what`, `gap-year-when`, `gap-year-how`, `gap-year-caveats`, `gap-year-references`, (c) asserts each of the 10 preserved subsection ids exists: `gap-year-events`, `gap-year-trad`, `gap-year-roth`, `gap-year-ltcg`, `gap-year-both`, `gap-year-destinations`, `gap-year-threshold`, `gap-year-age-cap`, `gap-year-invariants`, `gap-year-not-modeled`, (d) asserts the TOC `<nav>` contains 5 `<a href="#gap-year-...">` links and each `href` (minus the `#`) resolves to an element via `getElementById`. Use `// @vitest-environment jsdom` at the top. This test MUST fail before todo 3 lands and pass after.
  Commit: folded into commit for todo 3 (atomic refactor).

- [x] 3. Rewrite `mountGapYearPage` in `src/ui/gap-year-page.ts`
  What to do: Rebuild the template literal so it emits, in order:
    1. `<h1 id="gap-year">Gap-Year Strategy — Escaping Thai PIT in a Single Calendar Year</h1>`
    2. The existing intro `<p>` (Section 41 / Paw 161/2566) — unchanged text.
    3. A new `<nav class="toc" aria-label="On this page"><ul>` with 5 `<li><a href="#gap-year-what|when|how|caveats|references">…</a></li>` items.
    4. `<h2 id="gap-year-what">What is a gap year?</h2>` followed by the existing "A gap year is most valuable when it unlocks three tax events…" paragraph and its `<ol>`, with the intermediate `<h2 id="gap-year-events">` demoted to `<h3 id="gap-year-events">Three tax events unlocked</h3>` placed BEFORE the paragraph.
    5. `<h2 id="gap-year-when">When does it make sense?</h2>` followed by the existing `#gap-year-threshold` block (demoted to `<h3>`) then `${AGE_CAP_HTML}` (already demoted in todo 1).
    6. `<h2 id="gap-year-how">What to do during a gap year?</h2>` followed by (a) `<h3 id="gap-year-destinations">Where to spend the gap year — destinations &amp; break-even</h3>` and its existing table + two paragraphs + `$15,000/yr uplift` paragraph, (b) `${TRAD_HTML}`, (c) `${ROTH_HTML}`, (d) `${LTCG_HTML}`, (e) `${BOTH_HTML}`.
    7. `<h2 id="gap-year-caveats">Caveats</h2>` followed by (a) `<h3 id="gap-year-invariants">Invariants that still apply during a gap year</h3>` and its `<ul>`, (b) `<h3 id="gap-year-not-modeled">What the calculator does <em>not</em> model</h3>` and its `<p>`.
    8. `<h2 id="gap-year-references">References</h2>` and its existing `<ul>` — unchanged.
  Text of paragraphs, list items, table rows, links, and citations remains byte-identical to the current file. Only heading tags and their surrounding `<section>`-free wrapping are edited. No new file. After the edit run `npm run typecheck`, `npm run test`, `npm run build`, and the LOC-ceiling check; all must exit 0. The new test from todo 2 must go green here.
  Commit: `refactor(ui): reorganize gap-year page into 5 sections with table of contents`

- [x] 4. Final verification wave
  What to do: Run the four commands from the Verification strategy in order and paste the exit codes. Confirm test count did not regress (should be prior count + 1 new test file). Confirm no file in `src/` or `tests/` exceeds 500 lines.
  Commit: none (verification only).

## Final verification wave

> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.

- [x] F1. Plan compliance audit — every "Must have" item present, every "Must NOT have" honored, all 10 preserved anchors present in the rendered DOM.
- [x] F2. Code quality review — no `any`, no `@ts-ignore`, template literal readable, both files under 500 LOC, no dead imports.
- [x] F3. Real manual QA — `npm run dev`, open the Gap-Year tab, click every TOC link, confirm each jumps to the correct section; confirm the year-table "Consider gap year abroad" hint still opens the tab at the top.
- [x] F4. Scope fidelity — no prose, constant, citation, table cell, or engine hook was modified; only heading levels, section wrappers, and the new TOC block.
