# Draft: fix-year-table-methodology-link

- slug: fix-year-table-methodology-link
- intent: clear
- review_required: false
- status: approved-pending-write
- pending_action: write .omo/plans/fix-year-table-methodology-link.md

## Approach

Fix broken navigation from year-by-year table headers to methodology sections in the SPA.

## Decisions (locked)

- **Root cause A:** `src/ui/year-table.ts:77` emits `href="methodology.html#<anchor>"` but no such file exists — the app is a single-page app whose Methodology view is a `<section id="methodology-tab">` shown by JS tab switching. Clicking 404s on Pages/dev.
- **Root cause B:** Even a same-page `#anchor` would land inside a `.hidden` (`display:none`) section; we must also programmatically switch to the Methodology tab.
- **Root cause C (test blind spot):** `src/ui/year-table.test.ts` only validates anchor IDs exist in `methodologyAnchorSet()` — it never asserts the emitted `href` or click behavior, so the bug shipped green.
- **User-owned fork:** click behavior = switch to Methodology tab + smooth-scroll + update URL hash + support deep-link on load (chosen: option 2 of the interview).
- **URL hash format:** `#methodology/<sectionId>` (namespaced under `methodology/` to disambiguate from the plain in-page anchor scheme used inside the methodology container itself, and to encode "which tab + which section").
- **Deep-link handler:** in `bootstrap()` (`src/main.ts`), after mounting, inspect `location.hash`; if it matches `#methodology/<id>`, switch to methodology tab and scrollIntoView the target. Also listen for `hashchange`.
- **Tab-switch API:** `switchTab` is currently module-private in `main.ts`. Extract nothing — export it from a new tiny module `src/ui/navigate.ts` (≤50 LOC) that owns `switchTab` + `deepLinkToMethodology(id)` and is imported by both `main.ts` and `year-table.ts`. This avoids a circular import (`year-table` → `main`) and keeps concerns clean.
- **Header rendering change:** `year-table.ts` emits `<a href="#methodology/<id>" data-methodology-anchor="<id>">…</a>` and attaches ONE delegated click handler on the container that (a) `preventDefault`, (b) sets `location.hash = '#methodology/<id>'`, (c) calls `deepLinkToMethodology(id)`.
- **250-LOC guard:** all new files ≤ 250. `year-table.ts` is currently 97 lines — adding the click handler + `import` stays well under. `main.ts` (164) drops slightly after extracting `switchTab`.
- **TDD floor:** each behavior change is preceded by a failing test in the same commit.

## Ledgers

- Evidence:
  - `src/ui/year-table.ts:77` — bad href
  - `src/main.ts:20-30` — `switchTab` module-private
  - `index.html:33` — `#methodology-tab` starts hidden
  - `src/ui/methodology-page.ts:11-22` — smooth-scroll only applies to clicks INSIDE the methodology container
  - `src/ui/year-table.test.ts:8-14` — insufficient coverage
- Open unknowns: none.
- Assumptions verified: SPA (confirmed via `index.html` + `main.ts`), all anchor IDs exist in `methodologyAnchorSet()` (already gated by existing test).

## Approval gate

User answered the click-behavior fork on 2026-07-04. Writing plan now.
