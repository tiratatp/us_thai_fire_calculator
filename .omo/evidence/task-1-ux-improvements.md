# Task 1: Remove Birth Year Input — Evidence

## Changes Made

### `src/ui/form.ts`
- Removed `${renderNumber('birthYear', 'Birth Year', inputs.birthYear, 1900, new Date().getFullYear())}` from the Basics grid (line 30).
- Grid now has 3 fields: Current Age, Life Expectancy, Current USD/THB.

### `src/ui/form-schema.ts`
- Changed `birthYear: getNum('birthYear')` → `birthYear: new Date().getFullYear() - currentAge`.
- Birth year is now computed dynamically from the user's current age at form submission time.

### `src/ui/form.test.ts`
- Removed `fd.append('birthYear', '1980')` from the `parseFormData round-trip` test (it no longer exists in the form).
- Updated assertion from `expect(inputs.birthYear).toBe(new Date().getFullYear() - 40)` — works because `parseFormData` now computes it dynamically.

## Verification

- `npm run typecheck` — passed (no errors)
- `npm run test` — 29/29 test files, 314/314 tests passing
- `npm run build` — built successfully (283ms)
- LOC ceiling — no violations (all files ≤ 250 lines)

## Design Decisions

- `birthYear` remains in `UserInputs` type (engine depends on it for RMD age, etc.).
- `DEFAULT_USER_INPUTS.birthYear` (1988) unchanged — used as fallback in defaults.
- No engine tests modified (birth year computation is purely UI-layer).
- No other UI fields changed.
