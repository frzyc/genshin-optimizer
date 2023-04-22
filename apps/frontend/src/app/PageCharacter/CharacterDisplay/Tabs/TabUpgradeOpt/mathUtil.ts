// https://oeis.org/A008287
// step 1: a basic LUT with a few steps of Pascal's triangle
const quadrinomials = [
  [1],
  [1, 1, 1, 1],
  [1, 2, 3, 4, 3, 2, 1],
  [1, 3, 6, 10, 12, 12, 10, 6, 3, 1],
  [1, 4, 10, 20, 31, 40, 44, 40, 31, 20, 10, 4, 1],
  [1, 5, 15, 35, 65, 101, 135, 155, 155, 135, 101, 65, 35, 15, 5, 1],
]

// step 2: a function that builds out the LUT if it needs to.
export function quadrinomial(n: number, k: number) {
  while (n >= quadrinomials.length) {
    const s = quadrinomials.length

    const nextRow: number[] = []
    for (let i = 0, prev = s - 1; i <= 3 * s; i++) {
      const a = quadrinomials[prev][i - 3] ?? 0
      const b = quadrinomials[prev][i - 2] ?? 0
      const c = quadrinomials[prev][i - 1] ?? 0
      const d = quadrinomials[prev][i] ?? 0

      nextRow[i] = a + b + c + d
    }
    quadrinomials.push(nextRow)
  }
  return quadrinomials[n][k] ?? 0
}

// https://hewgill.com/picomath/javascript/erf.js.html
// very good algebraic approximation of erf function. Maximum deviation below 1.5e-7
export function erf(x: number) {
  // constants
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911

  // Save the sign of x
  let sign = 1
  if (x < 0) sign = -1
  x = Math.abs(x)

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

// Gaussian probability distribution. mean & variance can be omitted for standard Gaussian.
export function gaussPDF(x: number, mu?: number, sig2?: number) {
  if (mu === undefined) mu = 0
  if (sig2 === undefined) sig2 = 1

  if (sig2 <= 0) return 0
  return (
    Math.exp((-(mu - x) * (mu - x)) / sig2 / 2) / Math.sqrt(2 * Math.PI * sig2)
  )
}
