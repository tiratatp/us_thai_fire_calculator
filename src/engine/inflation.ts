/**
 * Inflation draws — a simple normal distribution parameterized by mean + sd.
 *
 * We model US and Thai inflation as independent (from each other and from
 * asset returns) normal random variables per simulation year. This is the
 * standard cFIREsim / Portfolio Visualizer approach; empirically inflation
 * is closer to normal than log-normal at the annual horizon.
 *
 * The caller supplies the standard-normal shock `z`; this function scales
 * and shifts it. Keeping the shock external means the Monte Carlo runner
 * owns all randomness in one place (the mulberry32 stream), which makes
 * runs bit-for-bit reproducible under a fixed seed.
 *
 * See .research/05-monte-carlo.md §3 (inflation model).
 */

import type { InflationDist } from '../types.js';

/**
 * Convert a standard-normal shock into an inflation draw under `dist`.
 *
 * Returns a decimal rate (e.g. 0.03 = 3%), which may be negative in
 * deflationary tail scenarios — this is intentional and matches the
 * historical CPI distribution.
 */
export function drawInflation(dist: InflationDist, z: number): number {
  return dist.mean + dist.sd * z;
}
