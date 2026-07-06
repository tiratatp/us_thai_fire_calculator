# Task 2 Learnings - Methodology Group Intros

The following intro strings were written for the 5 methodology groups in `src/methodology/content.ts`. These should be reused verbatim in Tasks 3-7 when creating the dedicated group content files.

## group-read-first
"This calculator is for educational purposes and does not constitute tax advice. Several key regulatory questions remain unsettled; please read these critical disclosures before proceeding."

## group-us-rules
"US federal tax rules for citizens abroad, covering ordinary income, capital gains, and retirement account distributions."

## group-thai-rules
"Thai tax residency and personal income tax rules, including the treatment of foreign-source income remitted to Thailand."

## group-interaction
"The interaction between US and Thai tax systems as governed by the 1996 tax treaty and foreign tax credit mechanisms."

## group-simulation
"The technical implementation of the simulation, including the Monte Carlo engine and the step-by-step drawdown algorithm."

## Task 3 Completion Note
- Created `src/methodology/content-read-first.ts`.
- Copied `DISCLAIMER_SECTION` from `content.ts` and `UNCERTAINTIES_SECTIONS[0]` from `content-uncertainties.ts` verbatim.
- Reused `group-read-first` intro string verbatim.
- Verified typecheck, tests, and LOC ceiling (< 500).

## Task 4 Completion Note
- Created `src/methodology/content-us-rules.ts`.
- Copied all 9 sections from `src/methodology/content-us.ts` verbatim in the specified order.
- Reused `group-us-rules` intro string verbatim.
- Verified typecheck, tests, and LOC ceiling (109 lines).
- Verified all 9 section IDs are present and in the correct order.

## Task 7 Completion Note
- Created `src/methodology/content-simulation.ts`.
- Copied 6 sections from `src/methodology/content-algo.ts` verbatim in the specified order.
- Reused `group-simulation` intro string verbatim.
- Verified `ftc-corrected` and `residency-180-days` are ABSENT (0 occurrences each).
- Verified all 6 included section IDs are present and in the correct order.
- Verified typecheck, tests, and LOC ceiling (80 lines).


## Task 6 Completion Note
- Created `src/methodology/content-interaction.ts`.
- Exports `INTERACTION_GROUP: MethodologyGroup`, id `group-interaction`.
- Copied 5 treaty sections from `src/methodology/content-treaty.ts` verbatim.
- Moved `ftc-corrected` from `src/methodology/content-algo.ts` (lines 11-24) verbatim.
- Reused `group-interaction` intro string verbatim.
- Verified all 6 section IDs are present and in the correct order.
- Verified typecheck, tests, and LOC ceiling (90 lines).
