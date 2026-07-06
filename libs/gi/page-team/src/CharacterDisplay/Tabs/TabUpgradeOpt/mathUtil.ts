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
