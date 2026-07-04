/**
 * Cholesky decomposition + correlated multivariate normal draws.
 *
 * Standard Cholesky-Banachiewicz algorithm: for a symmetric positive
 * semi-definite (PSD) matrix Σ, produce a lower-triangular L such that
 *
 *     L · Lᵀ = Σ
 *
 * Given independent N(0,1) draws z, `L · z` is distributed as
 * multivariate normal with correlation Σ. See .research/05-monte-carlo.md.
 *
 * All functions are pure. Inputs are `readonly`; outputs are fresh
 * arrays the caller may keep or throw away.
 */

/**
 * Decompose a symmetric PSD matrix into a lower-triangular L with L·Lᵀ = matrix.
 *
 * @throws Error when the matrix has a diagonal residual below `-1e-10`,
 *   which indicates it is not PSD (a small negative value from float
 *   rounding is clamped to 0 rather than rejected).
 */
export function choleskyDecompose(
  matrix: readonly (readonly number[])[],
): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i]![k]! * L[j]![k]!;

      if (i === j) {
        const diag = matrix[i]![i]! - sum;
        if (diag < -1e-10) {
          throw new Error(
            `choleskyDecompose: matrix is not PSD (diagonal residual ${diag} at index ${i})`,
          );
        }
        L[i]![j] = Math.sqrt(Math.max(0, diag));
      } else {
        const pivot = L[j]![j]!;
        // A zero pivot on a rank-deficient PSD matrix means the row is
        // already fully determined by prior rows; the off-diagonal is 0.
        L[i]![j] = pivot === 0 ? 0 : (matrix[i]![j]! - sum) / pivot;
      }
    }
  }
  return L;
}

/**
 * Given lower-triangular L and a vector of independent standard normals,
 * return the correlated draw `L · independent`.
 *
 * The independent vector must be at least `L.length` long; extra entries
 * are ignored (this lets callers over-allocate a scratch buffer).
 */
export function correlatedDraws(
  L: readonly (readonly number[])[],
  independent: readonly number[],
): number[] {
  const n = L.length;
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j <= i; j++) s += L[i]![j]! * independent[j]!;
    out[i] = s;
  }
  return out;
}
