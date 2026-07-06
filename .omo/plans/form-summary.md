# form-summary - Work Plan
## TL;DR (For humans)
We are adding a live-updating "Summary" section to the Input form that shows Current Total Assets (USD), Total Annual Expenses (USD), and a FIRE Target (USD).
The form will feature a new "Current USD/THB" input field (defaulting to 33) to convert your THB-denominated assets and expenses to USD. This input will ALSO be passed to the Monte Carlo engine to replace the long-term 35 THB/USD assumption, synchronizing the display and simulation.
The FIRE target multiplier is dynamic: if your retirement horizon (Life Expectancy - Current Age) is <= 30 years, it uses a 25x multiplier. If > 30 years, it uses a 33x multiplier. Both multipliers will link to methodology anchors.
Because `src/ui/form.ts` is exactly at the 250 LOC limit, we must split it (extracting the account row rendering to `src/ui/form-account.ts`) before adding the new UI logic. We will also optimize the form re-render cycle so the heavy summary DOM update doesn't cause input latency.

## Scope
- Add `currentFxUsdThb` to `UserInputs`, `DEFAULT_USER_INPUTS`, and `parseFormData` with validation (min: 20, max: 50, step: 0.1).
- Update `src/engine/monte-carlo.ts` so `initialState` sets `fxRateUsdThb` to `currentFxUsdThb`.
- Add `FIRE_MULTIPLIER_30_YR` and `FIRE_MULTIPLIER_LONG` to `src/data/constants.ts` wrapped in `Cited<T>`, and add corresponding anchors to `src/methodology/`.
- Extract account row rendering from `src/ui/form.ts` to `src/ui/form-account.ts` to avoid breaching the 250 LOC invariant.
- Add "Current USD/THB" to the Basics section.
- Add "Summary" section calculating total assets, expenses, and FIRE target, linking the multipliers to their methodology anchors.
- Calculation explicitly includes `travelUsdYr` added to the THB expenses converted to USD.
- Optimize the re-render cycle (e.g. updating the summary DOM node directly rather than re-rendering the entire form string on every keystroke).

## Verification strategy
- **TDD:** Write tests for the new constants in `constants.*.test.ts`.
- **TDD:** Update `src/ui/form.test.ts` to assert that the Summary section renders, updates correctly on input change without full re-render, and correctly computes totals using the inputted FX rate.
- **TDD:** Update `src/engine/monte-carlo.test.ts` to verify the initial FX rate respects the user input.
- **LOC Check:** Ensure no file exceeds 250 LOC after the refactor.

## Execution strategy
1. Move the hardcoded multipliers to `src/data/constants.ts` and update `src/methodology/`.
2. Update the type schemas, defaults, and Monte Carlo engine `initialState` to use `currentFxUsdThb`.
3. Refactor `src/ui/form.ts` to extract `renderAccount` to `src/ui/form-account.ts`.
4. Implement the Summary UI, `currentFxUsdThb` input, and DOM-only update optimization in `src/ui/form.ts`.

## Todos

- **src/data/ & src/methodology/: Add FIRE multipliers & Methodology Links - expect passing tests**
  - Add `FIRE_MULTIPLIER_30_YR` (25) and `FIRE_MULTIPLIER_LONG` (33) to `src/data/constants.ts` wrapped in `Cited<T>` (cite the Trinity study or safe withdrawal rate consensus).
  - Add entries to `src/methodology/content-*.ts` (e.g. an assumptions section) explaining the dynamic multiplier logic and linking the constants.
  - Add tests to `src/data/constants.*.test.ts`.
  - QA: `npm run test` passes.
  - Commit: `feat(data): add FIRE multipliers and methodology links`

- **src/types.ts, defaults & monte-carlo: Add currentFxUsdThb & Sync Engine - expect passing typecheck**
  - Add `currentFxUsdThb?: number` to `UserInputs` in `src/types.ts`.
  - Add `currentFxUsdThb: 33` to `DEFAULT_USER_INPUTS` in `src/data/defaults.ts`.
  - Update `parseFormData` in `src/ui/form-schema.ts` to parse `currentFxUsdThb`.
  - Update `runSimulation` in `src/engine/monte-carlo.ts` to set `initialState.fxRateUsdThb` = `inputs.currentFxUsdThb ?? DEFAULT_ASSUMPTION.fxUsdThb.mean`.
  - QA: `npm run test` and `npm run typecheck` passes.
  - Commit: `feat(engine): sync FX rate between user input and Monte Carlo simulation`

- **src/ui/form-account.ts: Extract account row render - expect 250 LOC compliance**
  - Create `src/ui/form-account.ts`.
  - Move the `renderAccount` string-builder function and its related constants/imports (`ACCOUNT_TYPES`, `CURRENCIES`) out of `src/ui/form.ts` into this new file.
  - Update imports in `src/ui/form.ts`.
  - QA: `npm run build` and `npm run test` pass. Run the LOC script.
  - Commit: `refactor(ui): extract account row rendering to avoid LOC breach`

- **src/ui/form.ts: Render currentFxUsdThb, Summary, and optimize updates - expect live updates**
  - Add `currentFxUsdThb` to the "Basics" section using `renderNumber(..., inputs.currentFxUsdThb ?? 33, 20, 50, 0.1)`.
  - Add a dedicated `<div id="live-summary">` section before the submit button.
  - Implement an `updateSummary(inputs)` function that:
    - Calculates `totalAssetUsd`: sum USD accounts + sum(THB accounts / `currentFxUsdThb`).
    - Calculates `totalExpenseUsd`: `travelUsdYr` + (sum of monthly THB * 12 + sum of yearly THB) / `currentFxUsdThb`.
    - Calculates `fireTargetUsd`: `totalExpenseUsd` * (if `lifeExpectancy - currentAge <= 30` ? `FIRE_MULTIPLIER_30_YR` : `FIRE_MULTIPLIER_LONG`).
    - Selects the `#live-summary` node and updates its `innerHTML` with the formatted numbers and methodology links, *without* calling the full `render()` function.
  - Modify the `input` event listener in `src/ui/form.ts`: on every keystroke, validate, parse formData, save inputs, and call `updateSummary(inputs)`. Only call the full `render()` when adding/removing accounts or changing age/life expectancy (where full re-render is structurally required).
  - Update `src/ui/form.test.ts` to mock/test the new summary values and direct DOM updates.
  - QA: `npm run test` passes.
  - Commit: `feat(ui): add optimized live form summary section and FX rate input`

## Final verification wave
- F1: Plan compliance audit
- F2: Code quality review (LOC <= 250, strict TypeScript)
- F3: Manual QA (the form live-updates accurately without input lag)
- F4: Scope fidelity

## Commit strategy
Atomic commits per component (data, engine, ui).

## Success criteria
The input form displays an accurate, live-updating summary of USD assets, USD expenses, and FIRE target. The engine uses the inputted FX rate. Re-renders are optimized, methodology links work, and the codebase remains under the 250 LOC per-file limit.
