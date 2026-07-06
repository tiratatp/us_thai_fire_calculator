# UX Improvements — Task Plan

- [x] 1. Deduplicate Age and Birth Year
- [x] 2. Update Field Validation and Parsing for Commas
- [x] 3. Implement Thousand Separators in Currency Inputs

## Task 1: Remove Birth Year Input — COMPLETE

## Summary
Removed the "Birth Year" input field from the form. Birth year is now auto-calculated from "Current Age" at form submission time via `new Date().getFullYear() - currentAge`.

## Files Changed
- `src/ui/form.ts` — Removed birth year input from Basics grid
- `src/ui/form-schema.ts` — `birthYear` now computed dynamically (line 86)
- `src/ui/form.test.ts` — Test updated to expect dynamic birthYear (line 160)

## Verification
- `npm run test` — 314/314 passing
- `npm run typecheck` — clean
- `npm run build` — clean
- LOC ceiling — no violations

## Evidence
See `.omo/evidence/task-1-ux-improvements.md`

## Final verification wave
- [x] F1. Plan compliance audit — APPROVED (all 3 tasks complete, no scope creep)
- [x] F2. Code quality review — APPROVED (clean TypeScript, no `any`, LOC ≤ 250)
- [x] F3. Real manual QA — APPROVED (form live-updates, birth year computed dynamically)
- [x] F4. Scope fidelity — APPROVED (no engine changes, no new dependencies)
