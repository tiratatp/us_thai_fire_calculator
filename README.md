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
- Assumes you're a Thai tax resident every year; the Gap year tab explains
  the <180-day strategy if you plan to spend some years outside Thailand
- Monte Carlo simulation with correlated returns + stochastic FX + inflation
- Corrected FTC per Oracle review (single primary taxer per income item)
- Value-test Roth conversion (defaults to 0 for Thai residents)
- References tab with citations for every constant

## Tabs

- **Inputs** — accounts, spending, target retirement year, success threshold, FX rate
- **Results** — success-rate summary, portfolio & withdrawal-source charts, year-by-year table
- **Monte Carlo** — how the simulation works and what the bands mean
- **Drawdown** — the fixed 12-step per-year sequence the engine executes
- **Gap year** — the <180-day Thai-non-resident lever and how to use it
- **References** — user-facing legal reference with per-constant citations; year-table column headers deep-link here via `#references/<anchor>`

## Development

```bash
npm ci
npm run dev          # local dev server
npm run test         # vitest run
npm run typecheck    # strict TypeScript
npm run build        # production bundle → dist/
npm run preview      # preview production build
```

## Deploy

GitHub Actions auto-deploys `dist/` to GitHub Pages on push to `main`.
Repo Settings → Pages → Source must be set to "GitHub Actions".

## Architecture

- `src/engine/` — pure functions: US tax, Thai tax, FTC, remittance,
  Roth conversion, RMD, drawdown, Monte Carlo, PRNG, Cholesky, FX, inflation
- `src/data/` — `Cited<T>` constants + defaults (single source of truth for the References tab)
- `src/methodology/` — 5 reader-task content groups (`content-read-first`,
  `content-us-rules`, `content-thai-rules`, `content-interaction`,
  `content-simulation`) composed by `content.ts` and rendered by `render.ts`
- `src/ui/` — form, results, year-by-year table, charts, and the
  Drawdown / Gap year / Monte Carlo / References page mounts + hash-based
  tab navigation
- `src/workers/` — Monte Carlo Web Worker
- `.research/` — source-of-truth research documents (01-08)
- `.omo/plans/` — locked work plans (v1 + subsequent feature plans)

## Methodology

Every bracket, threshold, and rule is defined in `src/data/constants.ts`
with a `Cited<T>` wrapper carrying source URL and retrieval date. The
References tab renders directly from these constants — the values shown
on screen and the values used by the engine are the same object.

## License

MIT — see LICENSE.
