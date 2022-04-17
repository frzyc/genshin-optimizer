// https://oeis.org/A008287
// step 1: a basic LUT with a few steps of Pascal's triangle
var quadrinomials = [
  [1],
  [1, 1, 1, 1,],
  [1, 2, 3, 4, 3, 2, 1],
  [1, 3, 6, 10, 12, 12, 10, 6, 3, 1],
  [1, 4, 10, 20, 31, 40, 44, 40, 31, 20, 10, 4, 1],
  [1, 5, 15, 35, 65, 101, 135, 155, 155, 135, 101, 65, 35, 15, 5, 1],
];

// step 2: a function that builds out the LUT if it needs to.
export function quadrinomial(n: number, k: number) {
  while (n >= quadrinomials.length) {
    let s = quadrinomials.length;

    let nextRow: number[] = [];
    for (let i = 0, prev = s - 1; i <= 3 * s; i++) {
      const a = quadrinomials[prev][i - 3] ?? 0
      const b = quadrinomials[prev][i - 2] ?? 0
      const c = quadrinomials[prev][i - 1] ?? 0
      const d = quadrinomials[prev][i] ?? 0

      nextRow[i] = a + b + c + d
    }
    quadrinomials.push(nextRow);
  }
  return quadrinomials[n][k] ?? 0;
}
