/** 
 * Extrapolate the single-precision number `float` to a double-precision number 
 * by assuming that the *actual* value has the fewest number of digits amongst
 * numbers that are rounded to `float`.
 * */
export function extrapolateFloat(float: number): number {
  if (Math.fround(float) !== float) {
    console.error(`Extrapolation error: ${float} is not a single-precision value`)
    return float
  }
  if (!isFinite(float)) return float
  if (float < 0) return -extrapolateFloat(-float)
  if (float === 0) return 0

  let [lower, upper] = roundingRange(float)
  const int = Math.floor(upper)
  const digits = [int.toString()]
  upper -= int
  lower -= int
  if (Math.floor(upper) === Math.floor(lower)) {
    digits.push(".")
    do {
      upper *= 10
      lower *= 10

      const uDigit = Math.floor(upper)
      const lDigit = Math.floor(lower)
      digits.push(uDigit.toString())

      upper -= uDigit
      lower -= lDigit

      if (uDigit !== lDigit) {
        if (upper === 0)
          console.warn(`Extrapolation error: extrapolated ${float} results in a midpoint}`)
        if (uDigit - lDigit !== 1)
          console.warn(`Extrapolation error: ambiguous value of ${float} (use ${digits.join("")}), the least significant digit could be ${lDigit + 1}`)
        break
      }
    } while (true)
  }

  const string = digits.join("")

  // Make sure we get the right number
  if (Math.fround(parseFloat(string)) !== float)
    console.error(`Extrapolation error: extrapolated ${float} to an incorrect number ${string}`)
  return parseFloat(string)
}

/// Return the range of numbers that are rounded to `float` under IEEE754
function roundingRange(float: number): [lower: number, upper: number] {
  const exponent = Math.floor(Math.log2(float)), multiplier = Math.pow(2, exponent)
  const normalized = float / multiplier
  if (normalized < 1 || normalized >= 2)
    throw new Error(`Unable to normalize ${float}`)
  const ulpOfOne = 1.1920928955078125e-07 // 2^-23, written as double
  const normalizedNext = normalized + ulpOfOne
  const normalizedPrev = normalized - (normalized === 1 ? ulpOfOne / 2 : ulpOfOne)
  const midNext = (normalized + normalizedNext) / 2
  const midPrev = (normalized + normalizedPrev) / 2
  return [midPrev * multiplier, midNext * multiplier]
}
