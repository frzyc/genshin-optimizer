/** Relative |a-b| / max(|a|,|b|,eps). WR ↔ Pando number-check helper. */
export function relDiff(a: number, b: number): number {
  const denom = Math.max(Math.abs(a), Math.abs(b), 1e-12)
  return Math.abs(a - b) / denom
}
