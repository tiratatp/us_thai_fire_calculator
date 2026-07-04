# US-Thai FIRE Calculator

A static-site retirement calculator for US citizens who are also Thai citizens
retiring in Thailand as Thai tax residents. Models US federal tax, Thai PIT
(post-2024 remittance rules), the 1996 US-Thai treaty, corrected per-item
foreign tax credit, and Monte Carlo simulation with both optimistic and
pessimistic regulatory scenarios.

**Live**: https://tiratatp.github.io/us_thai_fire_calculator/

## ⚠️ Disclaimer

**This is not tax advice.** This calculator implements a best-effort model of
US federal tax, Thai personal income tax, and the 1996 US-Thai treaty as
interpreted in mid-2026. Several key rules are UNSETTLED:

- Roth IRA treatment in Thailand (treaty predates Roth)
- Whether the 1996 treaty re-sources US-source pensions for FTC purposes
- Whether Paw 162/2566 grandfathering extends to retirement accounts (this
  calculator assumes it DOES NOT — a conservative reading)

Consult a cross-border tax professional before making retirement decisions.

## What it does

- 7 account types (Cash, Taxable Brokerage, Traditional 401k/IRA, Roth 401k/IRA, HSA)
- 2 currencies (USD, THB) per account
- Per-year Thai residency toggle (the <180-day lever)
- Monte Carlo simulation with correlated returns + stochastic FX + inflation
- Corrected FTC per Oracle review (single primary taxer per income item)
- Value-test Roth conversion (defaults to 0 for Thai residents)
- Methodology page with citations for every constant

## Development

```bash
npm ci
npm run dev          # local dev server
npm run test         # 273 tests
npm run typecheck    # strict TypeScript
npm run build        # production bundle → dist/
npm run preview      # preview production build
```

## Deploy

GitHub Actions auto-deploys `dist/` to GitHub Pages on push to `main`.
Repo Settings → Pages → Source must be set to "GitHub Actions".

## Architecture

- `src/engine/` — pure functions: US tax, Thai tax, FTC, remittance,
  Roth conversion, drawdown, Monte Carlo, PRNG, Cholesky, FX
- `src/data/` — Cited<T> constants (single source of truth for methodology page)
- `src/methodology/` — content + render (reads constants directly)
- `src/ui/` — form, results, year-by-year table, charts
- `src/workers/` — Monte Carlo Web Worker
- `.research/` — source-of-truth research documents (01-08)
- `.omo/plans/` — locked work plan

## Methodology

Every bracket, threshold, and rule is defined in `src/data/constants.ts`
with a `Cited<T>` wrapper carrying source URL and retrieval date. The
methodology page renders directly from these constants — the values shown
on screen and the values used by the engine are the same object.

## License

MIT — see LICENSE.
