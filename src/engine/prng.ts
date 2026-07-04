/**
 * Seeded pseudo-random number generator + Box-Muller normal sampler.
 *
 * mulberry32 is a small, fast, 32-bit-state PRNG that is deterministic
 * under a fixed seed. It is NOT cryptographically secure — it is used
 * here purely to make Monte Carlo trials reproducible across runs so
 * the UI can show the same P10/P50/P90 traces when the user re-opens
 * a saved plan.
 *
 * Source: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 * (public domain). See .research/05-monte-carlo.md §10.
 *
 * All functions here are pure: they close over a mutable local `state`
 * but produce no global side effects. The engine passes the rng closure
 * explicitly to every consumer.
 */

/**
 * Build a mulberry32 rng closure from a 32-bit integer seed.
 *
 * The returned function yields uniform floats in [0, 1) — never 1.0,
 * never NaN, never negative. Same seed ⇒ identical sequence forever.
 */
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Box-Muller transform: two independent uniforms → two independent
 * standard-normal draws.
 *
 * We clamp `u1` away from 0 because log(0) = -Infinity would poison
 * the downstream sqrt. The probability of hitting exactly 0 from
 * mulberry32 is 1/2^32, but the clamp costs nothing and keeps the
 * function total.
 */
export function normalPair(rng: () => number): readonly [number, number] {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  const r = Math.sqrt(-2 * Math.log(u1));
  const theta = 2 * Math.PI * u2;
  return [r * Math.cos(theta), r * Math.sin(theta)];
}
