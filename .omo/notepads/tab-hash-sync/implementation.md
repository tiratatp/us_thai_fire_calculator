# Top-Level Hash Sync — Implementation Notes

## Date
2026-07-04

## Changes Made to `src/main.ts`

### 1. `handleHash()` — expanded hash recognition
Previously only matched `#methodology/anchor`. Now also matches:
- `#inputs` → `switchTab('inputs')`
- `#results` → `switchTab('results')`
- `#methodology` → `switchTab('methodology')`
- `#methodology/anchor` → `switchTab('methodology')` + `deepLinkToMethodology(anchor)`
- Any other hash (e.g. `#foo`) → no-op (no tab switch, no scroll)

### 2. `.tab` click listener — hash sync on click
Added `history.pushState(null, '', '#' + target);` before `switchTab(target)` so clicking a tab button updates the URL bar.

### 3. `runSimulation()` — hash sync on simulation start
Added `history.pushState(null, '', '#results');` before `switchTab('results')` so starting a simulation navigates to the results tab with a hash update.

### 4. Import
Added `TabId` type import from `./ui/navigate.js` to satisfy `noUncheckedIndexedAccess`.

## Verification
- `npm run typecheck` — pass (exit 0)
- `npm run test` — 297/297 tests pass (28 test files)
- LOC ceiling — no violations (main.ts = 172 lines, well under 250)

## Design Notes
- Uses `history.pushState` (not `location.hash = ...`) to avoid triggering `hashchange` events during programmatic navigation, which would cause double-switching.
- The `hashchange` listener still fires for back/forward navigation, which is the desired behavior.
