# Reorganize Gap-Year Page — Learnings

## 2026-07-05 — Task: Demote `<h2>` to `<h3>` in gap-year-mechanics.ts

**What was done:**
Changed 5 `<h2>` fragments to `<h3>` in `src/ui/gap-year-mechanics.ts`:

| Line | Anchor | Heading Text |
|------|--------|-------------|
| Line 13 | `<h2 id="gap-year-age-cap">` | → `<h3 id="gap-year-age-cap">` |
| Line 39 | `<h2 id="gap-year-trad">` | → `<h3 id="gap-year-trad">` |
| Line 77 | `<h2 id="gap-year-roth">` | → `<h3 id="gap-year-roth">` |
| Line 109 | `<h2 id="gap-year-ltcg">` | → `<h3 id="gap-year-ltcg">` |
| Line 135 | `<h2 id="gap-year-both">` | → `<h3 id="gap-year-both">` |

**Why:**
The new gap-year page structure wraps these fragments under new `<h2>` top-level sections, so the fragment headings must become `<h3>` to maintain proper heading hierarchy.

**Verification:**
- `npm run typecheck` passed (exit 0)
- No `<h2 id="gap-year-*">` tags remain in the file
- All anchor IDs preserved unchanged

## 2026-07-05 — Task 2: Test file created

- Created `src/ui/gap-year-page.test.ts` (4 assertions)
- Follows existing UI test convention: `@vitest-environment jsdom`, `.js` import extension, `document.createElement('div')` container pattern
- Tests:
  1. **Substantial HTML** — innerHTML > 2000 chars (matches methodology-page.test.ts pattern)
  2. **5 top-level h2 anchors** — `gap-year-what`, `gap-year-when`, `gap-year-how`, `gap-year-caveats`, `gap-year-references`
  3. **10 preserved subsection anchors** — all IDs from current page + mechanics fragments must survive reorganization
  4. **TOC `<nav>` with 5 links** — each `href` resolves via `getElementById`
- `npm run typecheck` passes ✅
- Test will **fail at runtime** until todo 3 (page rewrite) restructures the h2 elements — this is intentional per the work plan

## F3 Manual QA Verification
- **Dev Server**: Started successfully on port 5176.
- **TOC Links**: PASS. Clicked all 5 links ("What is a gap year?", "When does it make sense?", "What to do during a gap year?", "Caveats", "References"). URL hashes updated correctly, and the browser scrolled to each section.
- **Gap Year Hint Click**: FAIL. The "Consider gap year abroad" text in the table cells is rendered as plain text (`<td>Consider gap year abroad</td>`) and is not clickable. Clicking the column header "Gap year?" works and navigates to the tab, but the hint itself cannot be clicked.
- **Console Errors**: PASS. Zero console errors during all interactions.
- **Verdict**: FAIL (due to unclickable hint text in the table rows).

## 2026-07-06 — Orchestrator clarification on F3 verdict

Subagent (session ses_0c9db13bfffeck59X9u8FLhYTi) reported F3 FAIL because the literal `<td>Consider gap year abroad</td>` hint-cell text is not clickable. This is a scope misunderstanding, not a real defect:

- `src/ui/year-table.ts` and `src/ui/year-table.gap-year.test.ts` are UNCHANGED by this plan (`git diff --stat` confirms zero diff) — both files are explicitly out of scope per the plan's "Must NOT have" list.
- The hint-cell text was never designed to be clickable; it is informational only (see code comment at line 19-22 of year-table.ts: "a \"consider a gap year abroad\" hint is shown for a row").
- The actual, pre-existing, unit-tested navigation mechanism is the "Gap year?" COLUMN HEADER link (`<a href="#gap-year" data-tab-target="gap-year">`), introduced unchanged in commit d7e7be1 and covered by the existing test "clicking switches to gap-year tab and sets hash" in year-table.gap-year.test.ts.
- Subagent's own Playwright evidence confirms clicking the header link DOES correctly open the Gap-Year tab scrolled to the top, with 0 console errors.
- All 5 TOC links (the actual deliverable of this plan) were individually verified via Playwright: URL hash updates correctly for each, and each target `<h2>` section scrolls into view. Zero console errors throughout.

**Orchestrator verdict: F3 PASS.** The reorganization did not touch year-table.ts and did not regress the pre-existing header-link navigation. All in-scope TOC navigation behavior works correctly.
