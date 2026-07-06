# methodology-reader-task-sections - Work Plan

## TL;DR (For humans)

**What you'll get:** The methodology page reorganized from one flat list of ~31 topics into 5 reader-focused groups — "Read this first", "US tax rules that apply to you", "Thai tax rules that apply to you", "How the two systems interact", and "How this calculator simulates it" — with a nested table of contents. Every existing link into the page keeps working; every current column-header link from the year-by-year table still lands on the correct rule.

**Why this approach:** The reader-task framing groups sections by the question the reader is trying to answer, not by which tax authority wrote the rule — the Foreign Tax Credit belongs next to the treaty, not with the Monte Carlo code. Splitting the source files 1:1 with the on-page groups keeps future edits obvious: the file layout tells you where a section will appear.

**What it will NOT do:** No new tax rules, no changed numbers, no changes to the calculator engine or the 4 Systemic corrections. Only two visible content changes beyond regrouping: the two overlapping residency sections merge into one, and the Foreign Tax Credit section moves to sit next to Article 25.

**Effort:** Medium
**Risk:** Low — anchors preserved, engine untouched, existing tests protect against regression.
**Decisions to sanity-check:** (1) The 5 group titles below; (2) merging `residency-180-days` into `thai-residency` deletes the standalone anchor; (3) `ftc-corrected` moves out of the algorithm group into the interaction group.

Your next move: approve to authorize writing the plan into execution (e.g. `/start-work`), or ask for a high-accuracy review first.

---

> TL;DR (machine): Medium / Low / 5 group files replace 5 jurisdiction files; nested TOC (H2 groups + H3 sections); preserve every section id except residency-180-days (merged into thai-residency); no engine changes.

## Scope
### Must have
- 5 reader-task groups render as `<h2>` with a 1–2 sentence intro each.
- Every current section renders as `<h3>` under its correct group.
- Nested table of contents: outer `<ol>` of groups; each group item contains a nested `<ol>` of child sections.
- 30 of 31 current section IDs preserved (all except `residency-180-days` which merges into `thai-residency`).
- 5 new group IDs added: `group-read-first`, `group-us-rules`, `group-thai-rules`, `group-interaction`, `group-simulation`.
- `columnAnchorMap` in `src/ui/year-table.ts` needs no changes (all IDs it references — `monte-carlo-defaults`, `us-rmd-table`, `us-ltcg-2026`, `ftc-corrected`, `us-brackets-2026`, `thai-pit-brackets` — remain valid).
- Source files renamed to match groups: `content-read-first.ts`, `content-us-rules.ts`, `content-thai-rules.ts`, `content-interaction.ts`, `content-simulation.ts`. Old files deleted.
- `content.ts` exposes both `METHODOLOGY_GROUPS` (new) and `METHODOLOGY_SECTIONS` (flat, computed from groups, for back-compat with `methodologyAnchorSet`).
- `render.test.ts` updated: `residency-180-days` removed from required anchors; new tests for group headings and H3 sections.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No changes to `src/data/constants.ts` — AGENTS.md Core Invariant #4 (single source of truth for constants).
- No changes to `src/engine/*` — pure content/UI reorganization only.
- No new numeric claims, no new citations added to sections (moving citations is fine).
- No changes to the 4 Systemic corrections (AGENTS.md).
- No changes to the `#references/<id>` URL scheme or `navigate.ts`.
- No section id renames beyond the single `residency-180-days` deletion.
- No collapsing the injected `constant-tables` block into their sections (deferred to a future pass).
- No new dependencies. No markdown library. Plain HTML strings only.
- No `--force`, no `--no-verify`, no `git push --force`, no amended pushed commits.
- No file over 500 LOC (AGENTS.md Core Invariant #1).

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **tests-after for the mechanical file moves, TDD for the two shape changes** (nested TOC and H3 rendering). New assertions land in `src/methodology/render.test.ts` (Vitest, already configured).
- Every todo lists its `npm run` invocation (typecheck, test, build, LOC ceiling) as its own acceptance evidence. Evidence goes to `.omo/evidence/task-<N>-methodology-reader-task-sections.<ext>`.

Group-membership mapping (canonical, used by every content todo):

| Group id | Group title (H2) | Section IDs (in order, all rendered as H3) |
| --- | --- | --- |
| `group-read-first` | Read this first | `disclaimer`, `regulatory-uncertainties` |
| `group-us-rules` | US tax rules that apply to you | `us-brackets-2026`, `us-ltcg-2026`, `us-standard-deduction`, `us-niit`, `us-rmd-table`, `us-secure-2-age`, `roth-5yr-rules`, `early-withdrawal-penalty`, `hsa-post-65` |
| `group-thai-rules` | Thai tax rules that apply to you | `thai-residency` (merged with former `residency-180-days`), `thai-pit-brackets`, `thai-personal-allowance`, `thai-pension-deduction`, `por-161-remittance`, `paw-162-grandfathering`, `thai-cgt-set-listed` |
| `group-interaction` | How the two systems interact | `treaty-article-20`, `treaty-article-25`, `saving-clause`, `treaty-resourcing`, `roth-uncertainty`, `ftc-corrected` |
| `group-simulation` | How this calculator simulates it | `roth-conversion-value-test`, `monte-carlo-defaults`, `correlation-matrix`, `mulberry32`, `thai-tax-timing`, `fire-multipliers` |

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.

- **Wave 1** (foundation, sequential): Task 1 (types), Task 2 (composer skeleton with empty GROUPS + flat back-compat export).
- **Wave 2** (content moves, parallelizable across Tasks 3–7): Tasks 3–7 each build one group's `content-<group>.ts`.
- **Wave 3** (renderer, sequential after Wave 2): Task 8 (renderSubsection + renderGroup + nested TOC in `render.ts`), Task 9 (`render.test.ts` updates), Task 10 (delete old files + LOC audit).
- **Wave 4** (final verification): F1–F4.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 (types) | — | 2, 3–7, 8 | — |
| 2 (composer) | 1 | 3–7, 8 | — |
| 3 (read-first) | 2 | 8, 10 | 4, 5, 6, 7 |
| 4 (us-rules) | 2 | 8, 10 | 3, 5, 6, 7 |
| 5 (thai-rules, includes merge) | 2 | 8, 9, 10 | 3, 4, 6, 7 |
| 6 (interaction) | 2 | 8, 10 | 3, 4, 5, 7 |
| 7 (simulation) | 2 | 8, 10 | 3, 4, 5, 6 |
| 8 (renderer + nested TOC) | 3–7 | 9 | — |
| 9 (test updates) | 5 (merge), 8 | 10 | — |
| 10 (delete legacy files + LOC audit) | 3–7, 8, 9 | F1–F4 | — |
| F1–F4 | 1–10 | — | F1‖F2‖F3‖F4 |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. src/methodology/content.ts: Add MethodologyGroup type and re-export MethodologySection unchanged
  What to do / Must NOT do: Add `export interface MethodologyGroup { readonly id: string; readonly title: string; readonly intro: string; readonly sections: readonly MethodologySection[]; }` next to the existing `MethodologySection` interface. Do NOT alter `MethodologySection` shape (id/title/paragraphs/citations/constantRef stay identical) — every downstream test and renderer field-accesses this shape. Do NOT add any group field to `MethodologySection` — group membership lives on the outer `MethodologyGroup`, not on each section.
  Parallelization: Wave 1 | Blocked by: — | Blocks: T2, T3a–e, T4
  References (executor has NO interview context - be exhaustive): src/methodology/content.ts:19-40 (existing MethodologyCitation, MethodologySection interfaces), src/methodology/render.ts:8 (import type MethodologySection), AGENTS.md §Core-invariants (LOC ≤ 500, TS strict, no any).
  Acceptance criteria (agent-executable): `npm run typecheck` exits 0. `grep -n "MethodologyGroup" src/methodology/content.ts` prints exactly one export line. `wc -l src/methodology/content.ts` under 500.
  QA scenarios: happy — `npm run typecheck` (evidence `.omo/evidence/task-1-methodology-reader-task-sections.txt`). failure — deliberately import a non-existent field on `MethodologyGroup` in a scratch file; expect tsc error TS2551.
  Commit: Y | refactor(methodology): add MethodologyGroup type

- [x] 2. src/methodology/content.ts: Introduce empty METHODOLOGY_GROUPS composer and compute METHODOLOGY_SECTIONS from it
  What to do / Must NOT do: Replace the current `METHODOLOGY_SECTIONS = [DISCLAIMER, ...US_SECTIONS, ...]` array with (a) `export const METHODOLOGY_GROUPS: readonly MethodologyGroup[] = [...]` — for this todo it may contain the 5 group headers with `sections: []` placeholders and a TODO comment, wired to soon-to-exist imports from the 5 new files (which do not exist yet in Wave 1) — and (b) `export const METHODOLOGY_SECTIONS: readonly MethodologySection[] = METHODOLOGY_GROUPS.flatMap(g => g.sections)`. Since the group content files don't exist yet, this todo temporarily keeps the old imports (`US_SECTIONS` etc.) and builds groups from them inline so typecheck stays green. Do NOT delete `DISCLAIMER_SECTION` — it moves into `content-read-first.ts` in T3a but stays exported here for this todo only.
  Parallelization: Wave 1 | Blocked by: T1 | Blocks: T3a–e, T4
  References: src/methodology/content.ts:12-17 (existing imports of US/THAI/TREATY/ALGO/UNCERTAINTIES sections), src/methodology/content.ts:44-52 (DISCLAIMER_SECTION), src/methodology/content.ts:65-73 (current METHODOLOGY_SECTIONS), src/methodology/render.ts:14 (import { METHODOLOGY_SECTIONS, CORRELATION_MATRIX }), src/methodology/render.ts:115 (uses METHODOLOGY_SECTIONS for TOC), src/methodology/render.ts:139-141 (methodologyAnchorSet reads METHODOLOGY_SECTIONS).
  Acceptance criteria: `npm run typecheck` exits 0. `npm run test` — all existing tests pass with zero id changes (the rendered HTML is byte-identical because renderer still consumes flat `METHODOLOGY_SECTIONS`). `grep -n "METHODOLOGY_GROUPS" src/methodology/content.ts` prints exactly one export line.
  QA scenarios: happy — `npm run typecheck && npm run test` (evidence `.omo/evidence/task-2-methodology-reader-task-sections.txt`). failure — temporarily reorder one section id in an inline group; expect existing `renderMethodology` test in render.test.ts that checks disclaimer text still passes (order within group preserved).
  Commit: Y | refactor(methodology): introduce METHODOLOGY_GROUPS composer without moving content

- [x] 3. src/methodology/content-read-first.ts: Create Read-first group file with disclaimer + regulatory-uncertainties sections
  What to do / Must NOT do: Create new file exporting `export const READ_FIRST_GROUP: MethodologyGroup = { id: 'group-read-first', title: 'Read this first', intro: '<1–2 sentence intro>', sections: [DISCLAIMER_SECTION_OBJ, REGULATORY_UNCERTAINTIES_SECTION_OBJ] }`. Copy the `DISCLAIMER_SECTION` object from current `content.ts:44-52` verbatim and the `UNCERTAINTIES_SECTIONS[0]` object from `content-uncertainties.ts` verbatim — every paragraph, every citation URL, every id. Do NOT alter any string content or citation URL. Do NOT change section ids `disclaimer` or `regulatory-uncertainties`. Do NOT re-export `DISCLAIMER_SECTION` from content.ts after this todo — update `content.ts` to import from this new file. Intro copy: 1–2 sentences summarizing "this is not tax advice; four rules are unsettled; read these first."
  Parallelization: Wave 2 | Blocked by: T2 | Blocks: T4, T6 | Can parallelize with: T3b, T3c, T3d, T3e
  References: src/methodology/content.ts:44-52 (DISCLAIMER_SECTION), src/methodology/content-uncertainties.ts:11-… (UNCERTAINTIES_SECTIONS single entry `regulatory-uncertainties`), src/methodology/content.ts:12-17 (imports to rewire), AGENTS.md §File-ceiling (≤ 500 LOC).
  Acceptance criteria: `test -f src/methodology/content-read-first.ts` exits 0. `grep -c "id: 'disclaimer'" src/methodology/content-read-first.ts` == 1. `grep -c "id: 'regulatory-uncertainties'" src/methodology/content-read-first.ts` == 1. `wc -l src/methodology/content-read-first.ts` < 500. `npm run typecheck` exits 0. `npm run test` — all tests still pass (renderer still consumes flat list).
  QA scenarios: happy — full test suite green (evidence `.omo/evidence/task-3-methodology-reader-task-sections.txt`). failure — mutate one citation URL character; expect the render.test.ts assertion `has at least 15 https citation links` to remain green (this is a count test) but a manual diff of `renderMethodology()` output vs baseline HTML shows the changed character.
  Commit: Y | refactor(methodology): extract Read-first group

- [x] 4. src/methodology/content-us-rules.ts: Create US-rules group file with the 9 US sections
  What to do / Must NOT do: Create new file exporting `export const US_RULES_GROUP: MethodologyGroup` with id `group-us-rules`, title 'US tax rules that apply to you', 1–2 sentence intro, and sections = verbatim copies of the 9 entries currently in `content-us.ts` `US_SECTIONS`: `us-brackets-2026`, `us-ltcg-2026`, `us-standard-deduction`, `us-niit`, `us-rmd-table`, `us-secure-2-age`, `roth-5yr-rules`, `early-withdrawal-penalty`, `hsa-post-65`, IN THAT ORDER. Do NOT alter any paragraph text, id, or citation. Do NOT change bracket numbers (those live in `src/data/constants.ts` and this file never touches them). Do NOT reorder the sections.
  Parallelization: Wave 2 | Blocked by: T2 | Blocks: T4, T6 | Can parallelize with: T3a, T3c, T3d, T3e
  References: src/methodology/content-us.ts (entire file — 9 sections), src/data/constants.ts (source of any bracket references — not touched here), AGENTS.md §File-ceiling.
  Acceptance criteria: `test -f src/methodology/content-us-rules.ts` exits 0. For each of the 9 ids: `grep -c "id: '<id>'" src/methodology/content-us-rules.ts` == 1. Section order preserved: `grep -n "id: '" src/methodology/content-us-rules.ts` prints the 9 ids in the order listed above. `wc -l src/methodology/content-us-rules.ts` < 500. `npm run typecheck && npm run test` exit 0.
  QA scenarios: happy — full test suite green (evidence `.omo/evidence/task-4-methodology-reader-task-sections.txt`). failure — swap two adjacent section ids; expect render.test.ts's `renderMethodology` regex/order check (add one in Task 9 if not already present) to fail.
  Commit: Y | refactor(methodology): extract US-rules group

- [x] 5. src/methodology/content-thai-rules.ts: Create Thai-rules group file AND merge residency-180-days into thai-residency
  What to do / Must NOT do: Create new file exporting `export const THAI_RULES_GROUP: MethodologyGroup` with id `group-thai-rules`, title 'Thai tax rules that apply to you', 1–2 sentence intro, and sections in this order: `thai-residency` (MERGED), `thai-pit-brackets`, `thai-personal-allowance`, `thai-pension-deduction`, `por-161-remittance`, `paw-162-grandfathering`, `thai-cgt-set-listed`. **Merge step**: take the existing `thai-residency` section from `content-thai.ts:11-…` AND the existing `residency-180-days` section from `content-algo.ts:38-48` and produce ONE section with id `thai-residency`, title 'Thai Tax Residency — 180-Day Test and Planning Lever', paragraphs = the 2 existing residency-rule paragraphs FOLLOWED BY the 2 planning-lever paragraphs from `residency-180-days`, and citations = union (dedup by URL, preserve order). Do NOT keep a separate `residency-180-days` section object anywhere. Do NOT change any paragraph wording. Do NOT reorder within Thai-rules aside from the merge.
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 8, 9, 10 | Can parallelize with: 3, 4, 6, 7
  References: src/methodology/content-thai.ts (entire file — 7 sections including thai-residency at :11-21), src/methodology/content-algo.ts:38-48 (residency-180-days source paragraphs), src/methodology/render.test.ts:41 (`residency-180-days` in required anchor set — Task 9 removes this).
  Acceptance criteria: `test -f src/methodology/content-thai-rules.ts` exits 0. `grep -c "id: 'thai-residency'" src/methodology/content-thai-rules.ts` == 1. `grep -c "id: 'residency-180-days'" src/methodology/content-thai-rules.ts` == 0. All 7 Thai-rules ids present in order. `grep -c "180" src/methodology/content-thai-rules.ts` ≥ 2 (both rule-mention and planning-lever mention survive). `wc -l src/methodology/content-thai-rules.ts` < 500. `npm run typecheck` exits 0. `npm run test` may fail one assertion at this point (`render.test.ts:41` still expects `residency-180-days`) — that assertion is fixed in Task 9. Document the transient failure in evidence.
  QA scenarios: happy — after this todo + Task 9, `npm run test` is green. failure — omit the planning-lever paragraphs during merge; expect render.test.ts's `includes residency 180-days lever` test (`html.toLowerCase().includes('180')`) to still pass (it only checks the digit '180' — see `render.test.ts:63-68`), so ADD a stronger assertion in Task 9 that checks for the phrase "planning lever" or the words "under 180 days" specifically, and verify the failure surfaces.
  Commit: Y | refactor(methodology): extract Thai-rules group and merge residency-180-days into thai-residency

- [x] 6. src/methodology/content-interaction.ts: Create Interaction group with treaty sections + ftc-corrected
  What to do / Must NOT do: Create new file exporting `export const INTERACTION_GROUP: MethodologyGroup` with id `group-interaction`, title 'How the two systems interact', 1–2 sentence intro, and sections in this order: `treaty-article-20`, `treaty-article-25`, `saving-clause`, `treaty-resourcing`, `roth-uncertainty`, `ftc-corrected`. Copy the 5 treaty section objects from `content-treaty.ts` verbatim AND copy `ftc-corrected` from `content-algo.ts:11-24` verbatim into this file (this is the move from Algo to Interaction). Do NOT alter any paragraph, id, or citation. Do NOT keep `ftc-corrected` in the Simulation file (T3e must not include it).
  Parallelization: Wave 2 | Blocked by: T2 | Blocks: T4, T6 | Can parallelize with: T3a, T3b, T3c, T3e
  References: src/methodology/content-treaty.ts (entire file — 5 sections), src/methodology/content-algo.ts:11-24 (ftc-corrected source), src/ui/year-table.ts:39,42 (columnAnchorMap references `ftc-corrected` — id preserved, so no update needed).
  Acceptance criteria: `test -f src/methodology/content-interaction.ts` exits 0. Six section ids present in order. `grep -c "id: 'ftc-corrected'" src/methodology/content-interaction.ts` == 1. `wc -l src/methodology/content-interaction.ts` < 500. `npm run typecheck && npm run test` exit 0.
  QA scenarios: happy — full test suite green including render.test.ts's `includes ftc-corrected primary principle` assertion (evidence `.omo/evidence/task-6-methodology-reader-task-sections.txt`). failure — misspell `ftc-corrected` id; expect columnAnchorMap's `'Remittance amount USD' -> 'ftc-corrected'` mapping to point at a nonexistent anchor, which `methodologyAnchorSet` will not include — add a test that `columnAnchorMap` values are a subset of `methodologyAnchorSet` (this test lives in year-table.test.ts already per the AGENTS.md UI rule, verify it fires).
  Commit: Y | refactor(methodology): extract Interaction group and move ftc-corrected out of algorithm

- [x] 7. src/methodology/content-simulation.ts: Create Simulation group with the remaining algorithm/MC sections and FIRE multipliers
  What to do / Must NOT do: Create new file exporting `export const SIMULATION_GROUP: MethodologyGroup` with id `group-simulation`, title 'How this calculator simulates it', 1–2 sentence intro, and sections in this order: `roth-conversion-value-test`, `monte-carlo-defaults`, `correlation-matrix`, `mulberry32`, `thai-tax-timing`, `fire-multipliers`. Copy the corresponding objects from `content-algo.ts` AND `FIRE_MULTIPLIERS` from `content-algo.ts:97-112` verbatim. Do NOT include `ftc-corrected` (moved to Task 6). Do NOT include `residency-180-days` (merged into `thai-residency` in Task 5). Do NOT reorder within this group.
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 8, 10 | Can parallelize with: 3, 4, 5, 6
  References: src/methodology/content-algo.ts (entire file — 7 ALGO_SECTIONS entries + 1 FIRE_MULTIPLIERS entry; 2 entries leave: `ftc-corrected` → Task 6, `residency-180-days` → merged into Task 5).
  Acceptance criteria: `test -f src/methodology/content-simulation.ts` exits 0. Six section ids present in order. `grep -c "id: 'ftc-corrected'" src/methodology/content-simulation.ts` == 0. `grep -c "id: 'residency-180-days'" src/methodology/content-simulation.ts` == 0. `wc -l src/methodology/content-simulation.ts` < 500. `npm run typecheck && npm run test` exit 0.
  QA scenarios: happy — full test suite green (evidence `.omo/evidence/task-7-methodology-reader-task-sections.txt`). failure — accidentally include `ftc-corrected` here (duplicate with Task 6); expect a test we add in Task 9 (`METHODOLOGY_SECTIONS ids are unique`) to fail with duplicate detection.
  Commit: Y | refactor(methodology): extract Simulation group

- [x] 8. src/methodology/render.ts + src/methodology/content.ts: Rewire composer to import the 5 new group files and implement nested TOC + H2 groups + H3 sections
  What to do / Must NOT do: (a) In `content.ts`: replace the inline group construction from T2 with imports of the 5 new group constants — `import { READ_FIRST_GROUP } from './content-read-first.js';` etc. — and export `METHODOLOGY_GROUPS = [READ_FIRST_GROUP, US_RULES_GROUP, THAI_RULES_GROUP, INTERACTION_GROUP, SIMULATION_GROUP]`; keep `METHODOLOGY_SECTIONS = METHODOLOGY_GROUPS.flatMap(g => g.sections)` for back-compat with `methodologyAnchorSet`. Delete the old `US_SECTIONS`/`THAI_SECTIONS`/`TREATY_SECTIONS`/`ALGO_SECTIONS`/`UNCERTAINTIES_SECTIONS`/`FIRE_MULTIPLIERS` imports. Keep `DISCLAIMER_SECTION` export removed (it now lives in content-read-first.ts). (b) In `render.ts`: add `export function renderSubsection(section: MethodologySection): string` identical to current `renderSection` BUT emitting `<h3>` instead of `<h2>` and NOT wrapping citations block change; add `export function renderGroup(group: MethodologyGroup): string` that emits `<section class="group" id="${group.id}"><h2>${escapeHtml(group.title)}</h2><p class="intro">${escapeHtml(group.intro)}</p>${group.sections.map(renderSubsection).join('\n')}</section>`. (c) In `renderMethodology()`: replace `METHODOLOGY_SECTIONS.map(renderSection)` with `METHODOLOGY_GROUPS.map(renderGroup)`. Rewrite the TOC: outer `<ol>` of groups, each `<li><a href="#${group.id}">${title}</a><ol>` of child section links `<li><a href="#${section.id}">${title}</a></li>`. (d) Keep the existing `renderSection` function exported (backward-compatible) but no longer used by `renderMethodology`; do NOT delete it — third-party callers may exist. Do NOT change `methodologyAnchorSet()` — it still returns section-level anchors (not group-level) because `columnAnchorMap` targets sections, not groups. Do NOT change the injected `constant-tables` block position — leave it at the end unchanged. Do NOT emit `<h3>` from `renderSection`; renderSection stays `<h2>` for callers that still use it.
  Parallelization: Wave 3 | Blocked by: 3, 4, 5, 6, 7 | Blocks: 9
  References: src/methodology/render.ts (entire file, especially :28-43 renderSection, :114-135 renderMethodology, :139-141 methodologyAnchorSet), src/methodology/content.ts:12-17 (old imports), src/ui/year-table.ts:123 (`#references/${anchor}` link scheme — anchors are section ids, unchanged).
  Acceptance criteria: `npm run typecheck` exits 0. `npm run test` — all tests pass except the `residency-180-days` assertion in `render.test.ts:41` (fixed in Task 9); document the specific failure line. HTML output contains 5 `<section class="group"` occurrences and 30 `<h3>` occurrences (one per surviving section — 31 minus the merged one). Nested TOC: outer `<ol>` contains 5 `<li>` with nested `<ol>` inside each.
  QA scenarios: happy — `npm run test -- render.test` (evidence `.omo/evidence/task-8-methodology-reader-task-sections.txt`), then add temporary console.log of `renderMethodology()` char length; expect ≥ old length. failure — swap two group ids in `METHODOLOGY_GROUPS`; expect a Task 9-added test `METHODOLOGY_GROUPS ordering` to fail.
  Commit: Y | feat(methodology): render grouped methodology page with nested TOC

- [x] 9. src/methodology/render.test.ts: Update tests to drop residency-180-days and add group/H3/uniqueness assertions
  What to do / Must NOT do: (a) In the `methodologyAnchorSet` `required` array (line 32-44): remove the string `'residency-180-days'` — that anchor no longer exists (merged into `thai-residency`). Keep the other 10 anchors unchanged. (b) Strengthen the `includes residency 180-days lever` test (currently line 63-68): change the assertion from `html.toLowerCase().includes('180')` to also assert the phrase `under 180 days` (case-insensitive) appears, so a lazy merge that drops the planning-lever paragraphs fails the test. (c) Add new tests: (i) `renderMethodology emits 5 group headings` — regex-count `<section class="group"` == 5 AND count of `<h2>` inside groups == 5; (ii) `renderMethodology emits H3 per section` — assert `<h3>` count == `METHODOLOGY_SECTIONS.length` (30 after merge); (iii) `renderMethodology emits nested TOC` — assert the TOC block contains at least 5 nested `<ol>` (one per group); (iv) `METHODOLOGY_SECTIONS ids are unique` — assert `new Set(ids).size === ids.length` to catch accidental duplication (e.g. `ftc-corrected` in two files); (v) `METHODOLOGY_GROUPS covers all sections` — assert `METHODOLOGY_GROUPS.flatMap(g=>g.sections).length === METHODOLOGY_SECTIONS.length`. Do NOT modify the `paw-162 warning` test, the citation-count test, or the bracket-table tests. Do NOT delete any existing test — only relax/strengthen or add.
  Parallelization: Wave 3 | Blocked by: 5 (merge), 8 | Blocks: 10
  References: src/methodology/render.test.ts (entire file, especially :29-49 methodologyAnchorSet block, :63-68 residency 180-days test), src/methodology/content.ts (new METHODOLOGY_GROUPS export).
  Acceptance criteria: `npm run test -- render.test` exits 0. Test count strictly greater than current 12 (5 new tests added). `grep -c "residency-180-days" src/methodology/render.test.ts` == 0.
  QA scenarios: happy — full `npm run test` green (evidence `.omo/evidence/task-9-methodology-reader-task-sections.txt`). failure — revert Task 5's merge (put `residency-180-days` back as its own section), keep this test file's assertions: expect the new `renderMethodology emits H3 per section` count to be off by one because a duplicate `thai-residency`/`residency-180-days` pair exists.
  Commit: Y | test(methodology): update anchor set and add group/H3/uniqueness assertions

- [ ] 10. src/methodology/: Delete the 5 legacy content files and run full acceptance gate (LOC ceiling + typecheck + test + build)
  What to do / Must NOT do: (a) Delete `src/methodology/content-us.ts`, `src/methodology/content-thai.ts`, `src/methodology/content-treaty.ts`, `src/methodology/content-algo.ts`, `src/methodology/content-uncertainties.ts` — every symbol they exported is now covered by the 5 new group files. Confirm via `grep -rn "from './content-us" src/` and equivalents that no import remains. (b) Run the full AGENTS.md verify sequence: `npm run typecheck`, `npm run test`, `npm run build`. (c) Run the LOC ceiling audit: `find src tests -name '*.ts' -o -name '*.css' | xargs wc -l | awk '$1 > 500 && $2 != "total" {print "VIOLATION: " $0; f=1} END {exit f}'` — must exit 0. Do NOT keep any legacy file as a shim. Do NOT commit if any check fails.
  Parallelization: Wave 3 | Blocked by: 3, 4, 5, 6, 7, 8, 9 | Blocks: F1–F4
  References: AGENTS.md §Verify-commands (typecheck / test / build / LOC), the 5 legacy file paths above.
  Acceptance criteria: All four commands exit 0. No file over 500 LOC. `ls src/methodology/content-*.ts` prints exactly 6 entries: `content.ts`, `content-read-first.ts`, `content-us-rules.ts`, `content-thai-rules.ts`, `content-interaction.ts`, `content-simulation.ts` (note: `content.ts` matches this glob too).
  QA scenarios: happy — full acceptance gate green (evidence `.omo/evidence/task-10-methodology-reader-task-sections.txt` with all 4 command outputs concatenated). failure — leave one legacy file present; expect `npm run typecheck` to be green (unused file) but `grep -c "from './content-us'" src/methodology/` to detect a dangling import if any remained, and expect a follow-up cleanup pass to catch it.
  Commit: Y | refactor(methodology): delete legacy jurisdiction-split content files

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — Delegate an Oracle to read this plan file and every commit produced by Tasks 1–10, and verify: every scope-IN item was delivered, every scope-OUT boundary was respected, every acceptance criterion in every todo has evidence at the declared path. Prompt: "TASK: Oracle audits plan compliance. DELIVERABLE: PASS/FAIL with any deltas. SCOPE: .omo/plans/methodology-reader-task-sections.md vs commits since HEAD~10 (approx). VERIFY: cite line numbers in commits and plan."
- [ ] F2. Code quality review — Delegate an Oracle to review src/methodology/*.ts and src/methodology/render.ts for AGENTS.md violations (any/@ts-ignore/as unknown, unnecessary comments, magic numbers, files > 500 LOC, duplication of numeric tax constants into strings). Prompt: "TASK: Oracle reviews code quality. DELIVERABLE: PASS/FAIL with line-cited violations. SCOPE: src/methodology/. VERIFY: cite AGENTS.md invariant per finding."
- [ ] F3. Real manual QA — Delegate an unspecified-high agent to run `npm run dev`, open the app in a browser, click into the Methodology tab, verify: 5 group H2s render with intros; nested TOC clicks scroll to correct group; individual H3 anchors scroll correctly; year-by-year table column headers still deep-link into `#references/<id>` and open the Methodology tab at the correct H3. Evidence: screenshots at `.omo/evidence/task-F3-methodology-reader-task-sections/*.png`. Prompt includes exact click path.
- [ ] F4. Scope fidelity — Delegate an unspecified-high agent to compare rendered HTML from `renderMethodology()` before (git HEAD before Task 1) and after (git HEAD after Task 10): every paragraph text, every citation URL, every section id present before must be present after — EXCEPT the single expected deletion of `<section id="residency-180-days">` whose paragraphs now live under `<section id="thai-residency">`. Evidence: diff artifact at `.omo/evidence/task-F4-methodology-reader-task-sections.diff`.

## Commit strategy
Ten commits, one per todo, atomic Conventional-Commits format matching the established pattern (`git log --oneline`). No amending, no force-push, no `--no-verify`. Push only when the user explicitly asks (AGENTS.md commit rules). The recommended order matches todo numbering; Tasks 3–7 commits may be interleaved with Tasks 8/9/10 if a parallel executor reorders — the commit order does not need to match the dependency order, only the commit graph must be linear on `main`.

## Success criteria
- All 10 todos green with evidence.
- All 4 final-verification items PASS.
- `npm run typecheck && npm run test && npm run build` all exit 0.
- LOC ceiling audit exits 0 (no `src/methodology/*.ts` file over 500 lines).
- Rendered methodology page shows 5 groups with H2 headings, intros, and nested TOC; 30 sections rendered as H3 (one less than before because of the residency merge).
- `columnAnchorMap` in `src/ui/year-table.ts` unchanged; every column header link still resolves to a valid `#references/<id>`.
- No changes to `src/data/constants.ts`, `src/engine/*`, or any file outside `src/methodology/` and `src/methodology/*.test.ts`.
