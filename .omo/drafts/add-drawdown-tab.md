---
slug: add-drawdown-tab
status: awaiting-approval
intent: clear
pending-action: none
approach: Add new Drawdown tab with deep year-by-year table (14 columns) and per-account balance stacked-area chart. Reuses existing tab infrastructure, Chart.js patterns, and YearOutcome data. No engine changes.
---

# Draft: add-drawdown-tab

## Components (topology ledger)
| id | outcome | status | evidence path |
|---|---|---|---|
| drawdown-tab-html | HTML: tab button + panel | active | — |
| drawdown-render | UI: deep year table renderer | active | — |
| drawdown-chart | UI: per-account balance chart | active | — |
| main-wiring | App: bootstrap integration | active | — |
| drawdown-css | CSS: panel + table styles | active | — |
| drawdown-tests | Tests: render + chart validation | active | — |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Which scenario to show | Pessimistic only | Matches Results tab behavior (band delta shown in verdict) | Yes — can add optimistic toggle later |
| Table column count | 14 columns | Deep enough for drawdown analysis, wide but scrollable | Yes — can add/remove columns |
| Chart type | Stacked area with p10/p50/p90 bands | Matches portfolio chart pattern, shows per-account evolution | Yes — can change chart type |
| Chart grouping | Per-account by ID (USD+THB mixed) | Simplest to implement, `balancesByAccount` already has per-account data | Yes — can split THB/USD sub-charts |

## Findings (cited - path:lines)

### Tab architecture (`src/main.ts:130-176`)
- 3 tabs: `inputs`, `results`, `methodology`
- Tab switching via `data-tab` attribute + `switchTab()` in `navigate.ts`
- Hash-based routing: `#inputs | #results | #methodology`
- `bootstrap()` mounts form + methodology, handles hash routing
- `renderAllResults()` renders results summary, year table, both charts

### Tab navigation (`src/ui/navigate.ts:1-24`)
- `TabId = 'inputs' | 'results' | 'methodology'`
- `switchTab()` toggles `.active` class + `aria-selected`
- Tab panels matched by `id === ${target}-tab`
- Deep linking: `#methodology/{anchor}` scrolls to section

### Existing Results tab (`src/ui/results.ts:29-93`)
- Verdict card with FIRE/ConditionallyFIRE/NotFIRE badge
- Two-column grid: pessimistic vs optimistic success rate + median tax
- Delta note for regulatory exposure

### Year table (`src/ui/year-table.ts:69-119`)
- 10 columns: Year/Age, Thai portfolio, US portfolio, RMD, LTCG, Remit, US tax, Thai tax, FTC, Spending met
- Column headers link to methodology anchors via `columnAnchorMap()`
- Sticky first column on horizontal scroll
- `buildRow()` aggregates balances by currency

### Charts (`src/ui/charts.ts:1-154`)
- `portfolioBandChart()`: line chart with P10/P50/P90 bands
- `withdrawalSourceChart()`: stacked bar by remittance source type
- Both use Chart.js with responsive config

### Types (`src/types.ts`)
- `YearOutcome` (lines 177-194): year, age, isThaiResident, balancesByAccount, rmdAmount, rothConversionAmount, ltcgHarvestedAmount, remittances, usOrdinaryIncome, usLtcgIncome, usTax, thaiAssessable, thaiTax, ftcApplied, usTaxAfterFtc, spendingMet
- `SimResult` (lines 198-207): successRate, p10/p50/p90 YearOutcome[], medianTaxUsd, failedTrialCount, trialsRun
- `TabId` needs extension

### HTML structure (`index.html:14-33`)
- Tab buttons: `<button class="tab" data-tab="...">`
- Panels: `<section id="{tab}-tab" class="tab-panel hidden">`
- Results panel has: `#results-summary`, `#progress-bar`, `#results-error`, `#portfolio-chart-container`, `#withdrawal-chart-container`, `#year-table-container`

### CSS patterns (`src/style.css`)
- CSS custom properties for colors, spacing, radius
- `.tab`, `.tab.active`, `.tab-panel`, `.hidden`
- `.year-table` with sticky first column
- Chart containers: `border`, `border-radius`, `padding`, `margin-bottom`
- Mobile-first with `@media (min-width: 640px)` and `1024px`

### LOC constraint
- All files must be ≤ 250 lines
- `drawdown-tab.ts` must fit both render + chart functions within 250 LOC
- Current similar files: `year-table.ts` (120 lines), `results.ts` (93 lines), `charts.ts` (154 lines)

## Decisions (with rationale)

### D1: Single chart vs dual charts
**Decision:** One stacked-area chart showing per-account balance (USD + THB combined or split).
**Rationale:** `balancesByAccount` already has per-account data. Splitting THB/USD would require FX conversion logic (adding complexity). A single chart with USD-equivalent (converted at each year's FX rate) is simplest. If too crowded, split in v2.

### D2: Table column anchors
**Decision:** New columns map to existing methodology anchors where applicable (e.g., "US Tax" → `us-brackets-2026`, "RMD" → `us-rmd-table`). New columns without existing anchors get new methodology sections.
**Rationale:** Consistency with existing `year-table.ts` pattern. Column headers MUST link to valid anchors (enforced by test).

### D3: Wave 3 parallelization
**Decision:** CSS and main.ts wiring can be combined into one todo since CSS changes are minimal (chart container pattern reuse).
**Rationale:** Reduces total todos, CSS is trivial pattern copy.

## Scope IN
- New Drawdown tab (HTML + navigation + rendering)
- Deep year-by-year table (14 columns, pessimistic scenario)
- Per-account balance stacked-area chart
- CSS styles (reusing existing patterns)
- Unit tests for render + chart

## Scope OUT (Must NOT have)
- New Monte Carlo computation
- Engine changes
- Optimistic scenario drawdown
- Interactive table features (sort, filter, paginate)
- Changes to existing tab behavior
- New constants or data files
- Responsive breakpoint changes beyond existing patterns

## Open questions
1. **Chart data volume:** With lifeExpectancy - currentAge = 57 years, 8 accounts = 456 data points per percentile. Is a stacked area chart readable? → Answer: Yes, Chart.js handles this fine. If needed, skip every Nth year in v2.
2. **THB vs USD in chart:** Should balances be shown in original currency or converted? → Answer: Show original currency per account (Chart.js stacked area with different scales is problematic). Use USD-only chart or separate THB/USD sub-charts. For v1: USD accounts only in chart (most relevant for FIRE planning).
3. **Methodology anchors for new columns:** US Ordinary Income and US LTCG Income columns don't have dedicated anchors. → Answer: Map to existing `us-brackets-2026` and `us-ltcg-2026` anchors. These are the sections that define the bracket/threshold values.

## Approval gate
status: awaiting-approval
