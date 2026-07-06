# Make Portfolio Value & Withdrawal Charts Bigger

## Goal
Increase the rendered height of both the Portfolio Value band chart and the Withdrawal Amount stacked bar chart from their default canvas size (~300x150) to a more readable 400px tall.

## Scope
Single CSS change — one property added to two selectors.

## Plan

### Step 1: Add height to chart container CSS
- **File:** `src/style.css`, line ~129
- **Change:** Add `height: 400px;` to the existing rule for `#portfolio-chart-container, #withdrawal-chart-container`
- **Rationale:** Chart.js is already configured with `responsive: true, maintainAspectRatio: false`, so adding a container height is the only thing needed. The charts will fill the width and use the new 400px height.

### Step 2: Verify
- Run `npm run typecheck` — must exit 0
- Run `npm run test` — must exit 0
- Run `npm run build` — must exit 0
- Visual QA: open dev server, confirm both charts are noticeably taller and readable

## Risks & Contingencies
- **Container too tall on mobile:** 400px may be excessive on narrow screens. If so, add a media query to reduce to ~280px on screens < 640px.
- **Existing CSS variables:** Could use `--space-8 * 2 = 4rem = 64px` which is too small. 400px is a reasonable fixed height for data visualization charts.
