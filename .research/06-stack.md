# Simplest Static Financial Calculator on GitHub Pages — Stack Reference

## 1. Stack Recommendation: Vite Vanilla TypeScript

Vite vanilla-TS is the simplest and best choice:
- Zero framework overhead (no React runtime, no JSX transform)
- Native TypeScript + HMR + Rollup production build
- For 30 form fields + Monte Carlo + Chart.js, no framework is needed
- Scaffold: `npm create vite@latest -- --template vanilla-ts`

**Source:** https://vite.dev/guide/

## 2. package.json

```json
{
  "name": "us_thai_fire_calculator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vite": "^6.2.0",
    "vitest": "^3.1.0"
  },
  "dependencies": {
    "chart.js": "^4.4.8"
  }
}
```

## 3. vite.config.ts

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/us_thai_fire_calculator/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chart: ['chart.js'],
        },
      },
    },
  },
})
```

**Source:** https://vite.dev/guide/static-deploy#github-pages

## 4. tsconfig.json (strict)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"]
  },
  "include": ["src"]
}
```

## 5. GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Must set Pages source to "GitHub Actions" in Repo Settings → Pages.

**Source:** https://github.com/actions/starter-workflows/blob/main/pages/static.yml

## 6. Chart Library: Chart.js 4.x

- ~170 kB gzipped
- Native support for line charts with fill bands (percentiles) and stacked bars
- Actively maintained

Percentile band pattern:
```ts
{
  datasets: [
    { label: 'P5',  data: p5,  borderColor: 'transparent', fill: '-1', backgroundColor: 'rgba(59,130,246,0.10)' },
    { label: 'P50', data: p50, borderColor: 'rgb(59,130,246)' },
    { label: 'P95', data: p95, borderColor: 'transparent', fill: '+1', backgroundColor: 'rgba(59,130,246,0.10)' },
  ]
}
```

Stacked bar (drawdown-source view):
```ts
{
  type: 'bar',
  options: {
    scales: { x: { stacked: true }, y: { stacked: true } }
  }
}
```

**Source:** https://www.chartjs.org/docs/latest/

## 7. Vitest config

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
```

## 8. localStorage helper (typed)

```ts
const PREFIX = 'us_thai_fire_'

export function save<T>(key: string, data: T): void {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)) }
  catch (e) { console.warn('save failed', e) }
}

export function restore<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(PREFIX + key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch { return fallback }
}
```

## 9. Intl.NumberFormat (USD + THB)

```ts
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const thb = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })
// Note: 'th-TH' shows ฿ symbol; 'en-US' + THB shows "THB". Prefer consistency.
```

Gotchas:
- No auto-conversion. Convert numerically first, then format.
- Large THB values (35× USD). Show both when helpful.
- Use `Intl.NumberFormat` for locale-aware separators.

## 10. Web Worker for Monte Carlo

**Use a Web Worker.** 1,000-10,000 trials × 50 years × 4 correlated assets = significant compute that would freeze main thread for 2-4 seconds.

```ts
// src/workers/monte-carlo.worker.ts
self.onmessage = (e) => {
  const { trials, years, seed, params } = e.data
  const results = simulate(trials, years, seed, params)
  self.postMessage(results)
}

// main.ts
const worker = new Worker(new URL('./workers/monte-carlo.worker.ts', import.meta.url), { type: 'module' })
```

**Source:** https://vite.dev/guide/features.html#web-workers

## Project Structure

```
us_thai_fire_calculator/
├── .github/workflows/deploy.yml
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── public/
├── src/
│   ├── main.ts                  # App bootstrap
│   ├── engine/                  # Pure functions (tested)
│   │   ├── us-tax.ts            # US federal tax
│   │   ├── thai-tax.ts          # Thai PIT
│   │   ├── drawdown.ts          # Withdrawal ordering
│   │   ├── monte-carlo.ts       # Simulation
│   │   ├── rmd.ts               # RMD table + calc
│   │   └── fx.ts                # FX modeling
│   ├── data/
│   │   └── constants.ts         # Tax brackets, RMD table (with citations)
│   ├── methodology/
│   │   └── content.ts           # Methodology page content (references constants)
│   ├── ui/
│   │   ├── form.ts              # Input form
│   │   ├── results.ts           # FIRE target + summary
│   │   ├── year-table.ts        # Year-by-year table
│   │   └── charts.ts            # Chart.js configs
│   ├── workers/
│   │   └── monte-carlo.worker.ts
│   ├── storage.ts               # localStorage
│   └── types.ts                 # Shared types
└── .research/                   # Source-of-truth research docs (this folder)
```
