# reorganize-gap-year-page — Draft

- intent: clear
- review_required: false
- status: awaiting-approval
- pending-action: write .omo/plans/reorganize-gap-year-page.md

## User's ask (verbatim)

> organize gap year page into what is a gap year? when does it make sense? what to do during gap year? reference. add a table of content and use subheader as needed. Basically it should be simplier to read and follow

## Decisions (recorded from interview)

1. **"Invariants" placement:** under a new "Caveats" top-level section (user overrode "put under When", added Caveats as a peer).
2. **"Not modeled" placement:** under the same "Caveats" section.
3. **Destinations table:** first subsection under "What to do during a gap year" (a "Where to spend the gap year" subsection).
4. **TOC style:** flat one-level bulleted list, top-level sections only (5 bullets).
5. **File split:** keep current `gap-year-page.ts` orchestrator + `gap-year-mechanics.ts` fragments split; only re-arrange the assembly order and add the TOC.
6. **Anchor slugs:** descriptive top-level slugs `#gap-year-what`, `#gap-year-when`, `#gap-year-how`, `#gap-year-caveats`, `#gap-year-references`. Existing subsection anchors (`#gap-year-trad`, `#gap-year-roth`, `#gap-year-ltcg`, `#gap-year-both`, `#gap-year-destinations`, `#gap-year-threshold`, `#gap-year-age-cap`, `#gap-year-events`, `#gap-year-invariants`, `#gap-year-not-modeled`) are preserved so external links / bookmarks and the year-table `#gap-year` link keep working.

## Target structure

```
h1  #gap-year         Gap-Year Strategy — ...
    Intro paragraph (Section 41, Paw 161/2566)
    Table of contents (flat <ul> with 5 anchor links)

h2  #gap-year-what    What is a gap year?
    Intro-body content (short: what the 180-day rule is, why one calendar year matters)
    h3  #gap-year-events   Three tax events unlocked

h2  #gap-year-when    When does it make sense?
    h3  #gap-year-threshold  Why $10,000, not higher
    h3  #gap-year-age-cap    Why the hint stops at age 65

h2  #gap-year-how     What to do during a gap year?
    h3  #gap-year-destinations  Where to spend the gap year (destinations table + break-even)
    h3  #gap-year-trad          Large Traditional IRA / 401(k) withdrawal
    h3  #gap-year-roth          Roth conversion
    h3  #gap-year-ltcg          0%-federal LTCG harvest
    h3  #gap-year-both          Can I do both in the same year?

h2  #gap-year-caveats  Caveats
    h3  #gap-year-invariants     Invariants that still apply during a gap year
    h3  #gap-year-not-modeled    What the calculator does not model

h2  #gap-year-references  References
```

**Heading-level change:** existing `<h2>` inside the 5 mechanics HTML fragments (TRAD_HTML, ROTH_HTML, LTCG_HTML, BOTH_HTML, AGE_CAP_HTML) must become `<h3>` because they now nest under new `<h2>` top-level sections. Same for the other existing `<h2>` blocks in `gap-year-page.ts` (`#gap-year-events`, `#gap-year-destinations`, `#gap-year-threshold`, `#gap-year-invariants`, `#gap-year-not-modeled`).

## Constraints verified

- 500-LOC ceiling per file: current 251 + 156, TOC adds ≈ 15 lines to page → still well under.
- Year-table hint links to `#gap-year` (page anchor, unchanged) — test `year-table.gap-year.test.ts` unaffected.
- `columnAnchorMap()` / `methodologyAnchorSet()` are for the methodology tab, not the gap-year tab — no coupling.
- Escaping: static content, no `esc()` needed.

## Files touched

- `src/ui/gap-year-page.ts` — reorder assembly, add TOC, insert 5 new `<h2>` wrappers, demote inline `<h2>` to `<h3>`.
- `src/ui/gap-year-mechanics.ts` — change `<h2>` to `<h3>` in TRAD_HTML, ROTH_HTML, LTCG_HTML, BOTH_HTML, AGE_CAP_HTML.
- `src/ui/year-table.gap-year.test.ts` — no change (only asserts on `#gap-year` top anchor).
- No new files.

## Verification

- `npm run typecheck` — must exit 0.
- `npm run test` — 273 tests must stay green; specifically `year-table.gap-year.test.ts` still passes because the top `#gap-year` anchor is preserved.
- `npm run build` — must exit 0.
- LOC check: `find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | awk '$1 > 500 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'` — must pass.
- Agent-executed visual QA: mount page in jsdom, assert each new h2 anchor exists, and assert TOC links resolve to those anchors.

## Commits (planned)

1. `refactor(ui): reorganize gap-year page into 5 sections with table of contents`

One atomic commit (test + impl land together). Any test-only tweaks stay in the same commit.
