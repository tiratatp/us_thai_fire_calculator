---
slug: methodology-reader-task-sections
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/methodology-reader-task-sections.md
approach: Group the 31 flat methodology sections into 5 reader-task groups (Read-first / US rules / Thai rules / Interaction / Simulation), render as H2-groups + H3-sections + nested TOC, split source files 1:1 with groups (content-read-first.ts, content-us-rules.ts, content-thai-rules.ts, content-interaction.ts, content-simulation.ts), preserve every section id except merging residency-180-days into thai-residency.
---

# Draft: methodology-reader-task-sections

## Components (topology ledger)
| id | outcome | status | evidence |
| --- | --- | --- | --- |
| data-model | MethodologySection extended with optional group metadata (or MethodologyGroup type introduced) | active | src/methodology/content.ts:19-40 |
| content-split | 5 new content-*.ts files, one per group; each exports one *_SECTIONS array | active | src/methodology/content-us.ts, content-thai.ts, content-treaty.ts, content-algo.ts, content-uncertainties.ts |
| composer | content.ts assembles GROUPS = [{id, title, intro, sections}] preserving render order | active | src/methodology/content.ts:65-73 |
| renderer | render.ts emits nested TOC + H2 groups + H3 sections; preserves `<section id="...">` for every current section id | active | src/methodology/render.ts:28-141 |
| id-preservation | Every current section id survives except `residency-180-days` which merges into `thai-residency` | active | render.test.ts:41 requires update |
| year-table-compat | columnAnchorMap still resolves; no ids it references change | active | src/ui/year-table.ts:33-44 |
| tests | render.test.ts updated (drop residency-180-days from required set); new tests for group headings, nested TOC, and H3-per-section | active | src/methodology/render.test.ts |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
| --- | --- | --- | --- |
| Group intro copy | One 1–2 sentence intro per group written by the executor from the section titles it contains; no new tax claims | Keeps scope tight, avoids new citations | Yes |
| Group HTML wrapper | `<section class="group" id="group-<slug>"><h2>…</h2><p class="intro">…</p><section id="<child>"><h3>…</h3>…</section>…</section>` | Semantic, single wrapper per group, no extra div soup | Yes |
| `constant-tables` block stays at the end | Do not fold the injected US brackets / Thai brackets / RMD / correlation tables into their originating sections in this pass | Out of scope; would balloon the diff and change rendering of `<h2>` for constant tables which callers may screenshot | Yes |
| Test framework | Vitest (already used) — add tests to render.test.ts | Matches existing pattern | Yes |
| No behavior change to engine | This is a pure methodology/UI reorganization | AGENTS.md Systemic guards untouched | N/A |

## Findings (cited - path:lines)
- Current flat render order: `METHODOLOGY_SECTIONS = [DISCLAIMER, ...US_SECTIONS, ...THAI_SECTIONS, ...TREATY_SECTIONS, ...UNCERTAINTIES_SECTIONS, ...ALGO_SECTIONS, ...FIRE_MULTIPLIERS]` at `src/methodology/content.ts:65-73`.
- TOC is one flat `<ol>`; sections rendered as `<h2>` each in `renderSection` at `src/methodology/render.ts:28-43`, assembled in `renderMethodology` at `src/methodology/render.ts:114-135`.
- 31 sections total, IDs verified via grep against `src/methodology/content-*.ts` id/title fields.
- Year-table anchors `#references/<id>` are built at `src/ui/year-table.ts:123`; `columnAnchorMap` at `src/ui/year-table.ts:33-44` references: `monte-carlo-defaults`, `us-rmd-table`, `us-ltcg-2026`, `ftc-corrected`, `us-brackets-2026`, `thai-pit-brackets`. None of these ids change under this plan.
- `render.test.ts:32-48` asserts `methodologyAnchorSet()` contains `residency-180-days`. That assertion must be updated (removed) when the merge lands.
- `residency-180-days` is not referenced anywhere else in the repo per grep (only in `content-algo.ts:39` where it is defined, and `render.test.ts:41`).
- Every numeric tax constant already lives in `src/data/constants.ts` as `Cited<T>` — AGENTS.md Core Invariant #4. This plan does not add or duplicate constants.
- 500-LOC file ceiling: current `content-algo.ts` ≈ 113 lines, `content-thai.ts` ≈ ~90 lines. New group files will each be well under.

## Decisions (with rationale)
- **Grouping = by reader task, 5 groups** (user answer m0018). Reader-first framing improves discoverability of "how do the two systems interact" (currently split across treaty + algo files).
- **Rendering = H2 groups + H3 sections + nested TOC** (user answer m0018). Semantic HTML, preserves every existing `id`, biggest reader win.
- **IDs preserved exactly** (user answer m0018). Only NEW `id`s introduced are the 5 group ids: `group-read-first`, `group-us-rules`, `group-thai-rules`, `group-interaction`, `group-simulation`.
- **`ftc-corrected` moves to G4 Interaction** (user answer m0020). It's a treaty/FTC interaction rule, not a simulation detail.
- **`residency-180-days` merges into `thai-residency`** in G3 (user answer m0020). Zero external breakage — no `columnAnchorMap` link; only `render.test.ts:41` needs updating.
- **File split = rename to group ids** (user answer m0020). Source layout matches rendered structure 1:1. Deleting old jurisdiction-named files.
- **Merge policy = drop `residency-180-days` id** (executor decision, no user question needed): grep confirmed zero external references besides the test. Adding a redirect alias would add renderer complexity for no reader benefit.

## Scope IN
- Introduce `MethodologyGroup` type with `{id, title, intro, sections}`.
- Delete `content-us.ts`, `content-thai.ts`, `content-treaty.ts`, `content-algo.ts`, `content-uncertainties.ts`.
- Create `content-read-first.ts`, `content-us-rules.ts`, `content-thai-rules.ts`, `content-interaction.ts`, `content-simulation.ts`.
- Move sections into the file matching their new group (see mapping in the plan).
- Merge `residency-180-days` into `thai-residency`: append the planning-lever paragraph(s) to the existing `thai-residency` section; delete the separate `residency-180-days` object.
- Rewrite `content.ts` to compose `METHODOLOGY_GROUPS`; keep back-compat `METHODOLOGY_SECTIONS` as a flat computed derivative (for `methodologyAnchorSet` and any external callers).
- Update `render.ts`: nested TOC (`<ol>` of groups, each with nested `<ol>` of child sections); `renderGroup(group)` emits `<h2>` + intro + child `<h3>` sections via a new `renderSubsection(section)` that emits `<h3>` instead of `<h2>`.
- Update `render.test.ts`: drop `residency-180-days` from the required anchor set; add positive tests for group headings, nested TOC, and H3-per-section.
- Verify `year-table.test.ts` and `year-table.gap-year.test.ts` still pass unchanged.

## Scope OUT (Must NOT have)
- No new tax rules, no new constants, no changes to `src/data/constants.ts`.
- No changes to `src/engine/*` — this is UI/content only.
- No changes to the 4 Systemic corrections (AGENTS.md).
- No collapsing of the injected `constant-tables` block into their originating sections (deferred).
- No CSS design overhaul beyond the minimum needed for nested TOC + H3 legibility (add rules to `src/style.css` only if the existing cascade produces unusable output).
- No section id renames beyond the single deletion of `residency-180-days`.
- No changes to `#references/<id>` URL scheme in `navigate.ts` / `year-table.ts`.
- No new markdown/HTML rendering libraries. Continue plain string HTML.
- No commit push, no `--force`, no `--no-verify` (AGENTS.md commit rules).

## Open questions
None — all product forks resolved via m0018 and m0020.

## Approval gate
status: awaiting-approval
