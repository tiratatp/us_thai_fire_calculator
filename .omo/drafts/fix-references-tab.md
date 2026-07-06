# fix-references-tab - Draft

**Intent**: CLEAR
**Review Required**: false
**Status**: awaiting-approval

## Decisions
- Fix `index.html` by changing the References tab's internal IDs and data attributes from `methodology` to `references`.
- This correctly aligns the DOM with the TypeScript `TabId` and hash routing regex that were updated in the previous plan.

## Context
The previous plan (`add-drawdown-tab`) updated `src/main.ts` and `src/ui/navigate.ts` to expect `'references'` as the tab ID, but we explicitly avoided renaming the internal IDs in `index.html` to avoid risk. However, this broke the actual tab switching logic because `switchTab('references')` cannot find `data-tab="references"` or `id="references-tab"`.

We must update `index.html` to use `references` for the tab's `data-tab` and `id` attributes.