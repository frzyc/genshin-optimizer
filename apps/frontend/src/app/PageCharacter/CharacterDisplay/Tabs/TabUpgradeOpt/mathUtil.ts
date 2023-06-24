// `quadronomial` coefficients (See https://oeis.org/A008287)
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

// `sigr` and `sig_arr` constitute a near perfect hash (https://en.wikipedia.org/wiki/Perfect_hash_function) of all combinations for N=1 to N=5.
// prettier-ignore
const sig_arr = [270 / 1024, 80 / 1024, 0, 12 / 256, 8 / 256, 120 / 1024, 0, 60 / 1024, 4 / 256, 60 / 1024, 4 / 256, 30 / 1024, 24 / 256, 160 / 1024, 1 / 64, 1 / 64, 24 / 256, 1 / 64, 12 / 256, 0, 6 / 256, 2 / 16, 6 / 256, 0, 81 / 256, 16 / 256, 0, 27 / 64, 12 / 64, 0, 1 / 16, 1 / 16, 12 / 64, 1 / 16, 6 / 64, 3 / 4, 2 / 4, 243 / 1024, 32 / 1024, 0, 108 / 256, 32 / 256, 0, 9 / 64, 6 / 64, 48 / 256, 0, 24 / 256, 3 / 64, 5 / 1024, 3 / 64, 5 / 1024, 0, 405 / 1024, 80 / 1024, 0, 54 / 256, 90 / 1024, 40 / 1024, 0, 1 / 256, 1 / 256, 40 / 1024, 1 / 256, 20 / 1024, 9 / 16, 4 / 16, 0, 1 / 4, 1 / 4, 0, 1 / 4, 27 / 64, 8 / 64, 0, 6 / 16, 4 / 16, 10 / 1024, 0, 10 / 1024, 2 / 16, 0, 0, 0, 15 / 1024, 10 / 1024, 1 / 1024, 1 / 1024, 0, 1 / 1024]
const sigr = [35, 64, 70, 21, 33, 45, 12, 0, 53, 76, 48, 86]
/**
 * Manually cached multinomial distribution with uniform bins. Returns probability of (n1, n2, n3, n4) given N total rolls.
 * Algebraically = N! / (n1! n2! n3! n4!) * (1/4)^N
 *
 * WARNING: This function has undefined behavior for N > 5 and N = 0
 */
function sigma(ss: number[], N: number) {
  const ssum = ss.reduce((a, b) => a + b)
  if (ss.length > 4 || ssum > N) return 0
  if (ss.length === 4 && ssum !== N) return 0
  if (ss.length === 3) ss = [...ss, N - ssum]
  ss.sort().reverse()

  // t = 12
  // offset = -14
  let v = 13 * N + ss.length - 14 + 16 * ss[0]
  if (ss.length > 1) v += 4 * ss[1]
  const x = v % 12
  const y = Math.trunc(v / 12) // integer divide

  return sig_arr[x + sigr[y]]
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
        const p_comb = sigma([i1, i2, i3, i4], n)
        fn([i1, i2, i3, i4], p_comb)
      }
    }
  }
}
