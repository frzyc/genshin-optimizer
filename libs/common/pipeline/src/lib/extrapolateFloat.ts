type Options = {
  mantissaLen?: number
  forced?: boolean
}

/**
 * Extrapolate the single-precision number `val` to a double-precision number
 * by assuming that the *actual* value has the fewest number of digits amongst
 * numbers that are rounded to `val`. In case of ambiguity (multiple values
 * with the same number of digits round to `val`), return the original value.
 *
 * Implementation Note:
 * This is a stand-in for float conversion as `console.log` always print numbers
 * as double-precision. In a language with single-precision numbers, this can be
 * replaced with an equivalent of `doubleFromString(floatToString(val))`.
 *
 * Reference: This is inspired by
 * Section 3.1 in Printing Floating-Point Numbers: An Always Correct Method
 * (https://cseweb.ucsd.edu/~lerner/papers/fp-printing-popl16.pdf)
 * */
export function extrapolateFloat(val: number, options: Options = {}): number {
  if (!Number.isFinite(val)) return val
  if (val < 0) return -extrapolateFloat(-val, options)
  if (val === 0) return 0

  const { mantissaLen: n = 23, forced = false } = options
  if (!forced && roundMantissa(val, n) !== val) {
    console.error(
      `Extrapolation error: ${val} uses more than ${n} bits for mantissa`
    )
    return val
  }

  const [lower, upper] = roundingRange(val, n)
  const string = shortestInRange(lower, upper, val)

  // Make sure we get the right number
  if (!forced && Math.fround(Number.parseFloat(string)) !== val)
    console.error(
      `Extrapolation error: extrapolated ${val} to an incorrect number ${string}`
    )
  return Number.parseFloat(string)
}

/**
 * Return a value in range `[lower, upper]` with the fewest number of significant digits.
 *
 * In case of ambiguity, simply return the original value. The number is most likely not
 * hand-tuned as it is assumed to have only a few significant digits. So the extrapolated
 * number would provides no benefits.
 */
function shortestInRange(lower: number, upper: number, float: number): string {
  const int = Math.floor(upper)
  const digits = [int.toString()]
  upper -= int
  lower -= int

  if (Math.floor(upper) !== Math.floor(lower)) return int.toString()

  digits.push('.')
  for (;;) {
    upper *= 10
    lower *= 10

    const uDigit = Math.floor(upper)
    const lDigit = Math.floor(lower)
    digits.push(uDigit.toString())

    upper -= uDigit
    lower -= lDigit

    if (uDigit !== lDigit) {
      const string = digits.join('')
      if (upper === 0)
        console.warn(
          `Extrapolation error: extrapolating ${float} results in a midpoint} `
        )
      if (uDigit - lDigit !== 1) {
        console.warn(
          `Extrapolation error: ambiguous value of ${float} (use ${string}), the least significant digit could be ${
            lDigit + 1
          } `
        )
        // ambiguity
        return float.toString()
      }
      return string
    }
  }
}

/** Return the range of numbers that would be rounded (to-nearest) to `val` under `n`-bit-mantissa rounding */
function roundingRange(
  float: number,
  n: number
): [lower: number, upper: number] {
  const [sig, mul] = normalize(float)
  const ulpOfOne = (1 / 2) ** n
  const nextSig = sig + ulpOfOne
  const prevSig = sig - (sig === 1 ? ulpOfOne / 2 : ulpOfOne)
  const midNextSig = (sig + nextSig) / 2
  const midPrevSig = (sig + prevSig) / 2
  return [midPrevSig * mul, midNextSig * mul]
}

/** Round `val` to the nearest value with `n`-bit mantissa */
export function roundMantissa(val: number, n: number): number {
  const [sig, mul] = normalize(val)
  const unit = (1 / 2) ** n
  const roundedSig = Math.round(sig / unit) * unit
  return roundedSig * mul
}

/** Returns `[s, m]` such that `val == s * m`, `1 <= s < 2`, and `m` is a power of 2 */
function normalize(val: number): [number, number] {
  if (val === 0) return [0, 1]
  const exponent = Math.floor(Math.log2(val))
  const multiplier = 2 ** exponent
  const significand = val / multiplier
  if (!Number.isFinite(significand) || significand < 1 || significand >= 2)
    throw new Error(`Unable to normalize ${val} `)
  return [significand, multiplier]
}
