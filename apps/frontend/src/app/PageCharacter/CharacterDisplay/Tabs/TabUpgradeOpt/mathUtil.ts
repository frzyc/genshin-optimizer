// Quadronomial coefficients (See https://oeis.org/A008287)
// step 1: a basic lookup-table with a few steps of Pascal's triangle
const quadrinomials = [
  [1],
  [1, 1, 1, 1],
  [1, 2, 3, 4, 3, 2, 1],
  [1, 3, 6, 10, 12, 12, 10, 6, 3, 1],
  [1, 4, 10, 20, 31, 40, 44, 40, 31, 20, 10, 4, 1],
  [1, 5, 15, 35, 65, 101, 135, 155, 155, 135, 101, 65, 35, 15, 5, 1],
]

// step 2: a function that builds out the lookup-table if it needs to.
/**
 * Quadronomial coefficients (See https://oeis.org/A008287).
 * Returns the coefficient of x^k in (1 + x + x^2 + x^3)^n.
 */
export function quadrinomial(n: number, k: number) {
  if (n >= quadrinomials.length)
    throw Error('Input to `quadrinomial` leaves expected range 0 <= n <= 5')
  return quadrinomials[n][k] ?? 0
}

/**
 * Very good algebraic approximation of erf function. Maximum deviation below 1.5e-7.
 * Source: https://hewgill.com/picomath/javascript/erf.js.html
 */
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

/** Gaussian probability distribution. mean & variance can be omitted for a standard Gaussian. */
export function gaussPDF(x: number, mu?: number, sig2?: number) {
  if (mu === undefined) mu = 0
  if (sig2 === undefined) sig2 = 1

  if (sig2 <= 0) return 0
  return (
    Math.exp((-(mu - x) * (mu - x)) / sig2 / 2) / Math.sqrt(2 * Math.PI * sig2)
  )
}

const facts = [1, 1, 2, 6, 24, 120, 720]
/** Computes factorial `n!` for integer n. */
export function factorial(n: number) {
  while (n >= facts.length) facts.push(facts.length * facts[facts.length - 1])
  return facts[n]
}

/**
 * Multinomial distribution with 4 uniform bins. Returns probability of (n1, n2, n3, n4) given N total rolls.
 * Algebraically = N! / (n1! n2! n3! n4!) * (1/4)^N
 *
 * Note: Implementation relies on factorials. Don't use with N > 12.
 *
 * @param ni rolls numbers for each bin. Expects exactly 4 `ni` and for their sum to equal `N`.
 */
function multinomial4(
  n1: number,
  n2: number,
  n3: number,
  n4: number,
  N: number
) {
  if (n1 + n2 + n3 + n4 !== N) return 0

  return (
    (factorial(N) /
      factorial(n1) /
      factorial(n2) /
      factorial(n3) /
      factorial(n4)) *
    4 ** -N
  )
}

/** Crawl the upgrade distribution for `n` upgrades, with a callback function that accepts fn([n1, n2, n3, n4], prob) */
export function crawlUpgrades(
  n: number,
  fn: (n1234: number[], p: number) => void
) {
  if (n === 0) {
    fn([0, 0, 0, 0], 1)
    return
  }

  // Binomial(n+3, 3) branches to crawl.
  for (let i1 = n; i1 >= 0; i1--) {
    for (let i2 = n - i1; i2 >= 0; i2--) {
      for (let i3 = n - i1 - i2; i3 >= 0; i3--) {
        const i4 = n - i1 - i2 - i3
        const p_combination = multinomial4(i1, i2, i3, i4, n)
        fn([i1, i2, i3, i4], p_combination)
      }
    }
  }
}
