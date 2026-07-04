/**
 * USD/THB FX rate model — log-normal random walk with optional mean reversion.
 *
 * We model the log of the exchange rate rather than the rate itself so
 * the rate cannot cross zero, and so the "sd" parameter is directly the
 * annual log-return standard deviation (comparable across FX pairs).
 *
 * Per-step evolution:
 *
 *     log(rate_{t+1}) = log(rate_t)
 *                     + meanReversion * (log(mean) - log(rate_t)) * dt
 *                     + sdAnnualLog * z * sqrt(dt)
 *
 * where z is a standard-normal draw supplied by the caller. This is a
 * discrete Ornstein-Uhlenbeck process on the log scale. When
 * `meanReversion === 0` it collapses to a plain geometric random walk.
 *
 * See .research/05-monte-carlo.md §5 (FX model). The engine steps this
 * once per simulation year (dt=1). Tests pass fractional dt to check
 * the sqrt(dt) scaling; production callers stick to dt=1.
 */

import type { FxModel } from '../types.js';

/**
 * Advance the FX rate one time step of length `dt` under model `model`,
 * using `shockZ` as the standard-normal shock for that step.
 *
 * Pure: no side effects, no shared state. Given identical inputs it
 * always returns the identical output.
 */
export function stepFx(
  currentRate: number,
  shockZ: number,
  model: FxModel,
  dt: number = 1,
): number {
  const logCurrent = Math.log(currentRate);
  const logMean = Math.log(model.mean);
  const pull = model.meanReversion * (logMean - logCurrent) * dt;
  const shock = model.sdAnnualLog * shockZ * Math.sqrt(dt);
  return Math.exp(logCurrent + pull + shock);
}
