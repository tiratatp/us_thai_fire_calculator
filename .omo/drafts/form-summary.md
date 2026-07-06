intent: clear
review_required: false
status: awaiting-approval
pending_action: write .omo/plans/form-summary.md
components:
  - id: input-form-summary
    outcome: Display live-updating asset, expense, and FIRE target summaries in the Input tab.
    status: pending
    evidence: src/ui/form.ts
decisions:
  - fx-rate: Add 'Current USD/THB' input to the Basics section, defaulting to 33, saved to localStorage.
  - fire-target: Dynamic multiplier based on (Life Expectancy - Current Age). If <= 30 years, use 25x (4% rule). If > 30 years, use 33x (~3% rule). Add a disclaimer note.
  - test-strategy: TDD / Agent-executed QA for the UI rendering and calculation logic.