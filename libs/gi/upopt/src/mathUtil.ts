import { range } from "@genshin-optimizer/common/util";

// Quadronomial coefficients (See https://oeis.org/A008287)
// step 1: a basic lookup-table with a few steps of Pascal's triangle
const quadrinomials = [
  [1],
  [1, 1, 1, 1],
  [1, 2, 3, 4, 3, 2, 1],
  [1, 3, 6, 10, 12, 12, 10, 6, 3, 1],
  [1, 4, 10, 20, 31, 40, 44, 40, 31, 20, 10, 4, 1],
  [1, 5, 15, 35, 65, 101, 135, 155, 155, 135, 101, 65, 35, 15, 5, 1],
  [
    1, 6, 21, 56, 120, 216, 336, 456, 546, 580, 546, 456, 336, 216, 120, 56, 21,
    6, 1,
  ],
];

// step 2: a function that builds out the lookup-table if it needs to.
/**
 * Quadronomial coefficients (See https://oeis.org/A008287).
 * Returns the coefficient of x^k in (1 + x + x^2 + x^3)^n.
 */
export function quadrinomial(n: number, k: number) {
  if (n >= quadrinomials.length)
    throw Error("Input to `quadrinomial` leaves expected range 0 <= n <= 5");
  return quadrinomials[n][k] ?? 0;
}

/**
 * Very good algebraic approximation of erf function. Maximum deviation below 1.5e-7.
 * Source: https://hewgill.com/picomath/javascript/erf.js.html
 */
export function erf(x: number) {
  // constants
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;

  // Save the sign of x
  let sign = 1;
  if (x < 0) sign = -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/** Gaussian probability distribution. mean & variance can be omitted for a standard Gaussian. */
export function gaussPDF(x: number, mu?: number, sig2?: number) {
  if (mu === undefined) mu = 0;
  if (sig2 === undefined) sig2 = 1;

  if (sig2 <= 0) return 0;
  return (
    Math.exp((-(mu - x) * (mu - x)) / sig2 / 2) / Math.sqrt(2 * Math.PI * sig2)
  );
}

const facts = [1, 1, 2, 6, 24, 120, 720];
/** Computes factorial `n!` for integer n. */
export function factorial(n: number) {
  while (n >= facts.length) facts.push(facts.length * facts[facts.length - 1]);
  return facts[n];
}

export function diag(v: number[]) {
  return v.map((x, i) => v.map((_, j) => (i === j ? x : 0)));
}

/**
 * Given a list of counts in 4 bins and optionally reshaping constraints,
 *   return the probability of that configuration occurring.
 *
 * Reshape { min, total, n } constraints: n bins must have at least `min` total counts.
 * Bins are chosen uniformly at first, but then forced into the selected bins if required.
 *
 * Note: Implementation relies on factorials. Don't use with sum(n1234) > 12.
 */
const rollCountPCache: Record<string, number> = {};
export function rollCountProb(n1234: number[], reshape?: ReshapeInfo) {
  n1234 = [...n1234];
  n1234.sort((a, b) => b - a);
  const key = JSON.stringify({ n1234, reshape });
  if (rollCountPCache[key] !== undefined) return rollCountPCache[key];

  const N = n1234.reduce((a, b) => a + b, 0);
  const factNs = n1234.reduce((a, b) => a * factorial(b), 1);
  if (!reshape || reshape.min === 0 || reshape.total > reshape.min) {
    const p = (factorial(N) / factNs) * 4 ** -N;
    rollCountPCache[key] = p;
    return p;
  }
  if (reshape.total < reshape.min) {
    rollCountPCache[key] = 0;
    return 0;
  }

  // reshape total == min
  const p_total_equal_min = range(0, reshape.total).reduce(
    (_, k) =>
      _ +
      (factorial(N) / factorial(k) / factorial(N - k)) *
        (reshape.n / 4) ** k *
        (1 - reshape.n / 4) ** (N - k),
    0,
  );
  const p_rolls =
    ((factorial(reshape.total) * factorial(N - reshape.total)) / factNs) *
    (1 / reshape.n) ** reshape.total *
    (1 / (4 - reshape.n)) ** (N - reshape.total);
  rollCountPCache[key] = p_total_equal_min * p_rolls;

  return p_total_equal_min * p_rolls;
}

const rollMuVarCache: Record<string, { mu: number[]; cov: number[][] }> = {};
export function rollCountMuVar(
  rollsLeft: number,
  reshape: { n: number; min: number },
): { mu: number[]; cov: number[][] } {
  const cacheKey = JSON.stringify({ rollsLeft, reshape });
  if (rollMuVarCache[cacheKey]) return rollMuVarCache[cacheKey];

  const distr = crawlUpgrades(rollsLeft).map((counts) => {
    const total = counts.slice(0, reshape.n).reduce((a, b) => a + b, 0);
    return { p: rollCountProb(counts, { ...reshape, total }), counts };
  });

  const mu = distr.reduce(
    (a, { p, counts }) => a.map((v, i) => v + p * counts[i]),
    [0, 0, 0, 0],
  );
  const cov = distr.reduce(
    (a, { p, counts }) => {
      counts.forEach((ci, i) => {
        counts.forEach((cj, j) => {
          a[i][j] += p * (ci - mu[i]) * (cj - mu[j]);
        });
      });
      return a;
    },
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
  );

  rollMuVarCache[cacheKey] = { mu, cov };
  return { mu, cov };
}

/** Crawl the upgrade distribution for `n` upgrades, with a callback function that accepts fn([n1, n2, n3, n4], prob) */
export function crawlUpgrades(n: number): number[][] {
  if (n === 0) {
    return [[0, 0, 0, 0]];
  }

  const out: number[][] = [];
  // Binomial(n+3, 3) branches to crawl.
  for (let i1 = n; i1 >= 0; i1--) {
    for (let i2 = n - i1; i2 >= 0; i2--) {
      for (let i3 = n - i1 - i2; i3 >= 0; i3--) {
        out.push([i1, i2, i3, n - i1 - i2 - i3]);
      }
    }
  }
  return out;
}

type ReshapeInfo = {
  min: number; // Minimum total rolls on selected affixes
  total: number; // Actual total rolls on selected affixes
  n: number; // Number of selected affixes
};
