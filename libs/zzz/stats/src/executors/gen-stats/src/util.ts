import { parseFloatBetter } from '@genshin-optimizer/common/util'

export function extractParamsFromString(str: string) {
  return [
    ...str
      // Remove commas from numbers
      .replaceAll(',', '')
      // Match (number with possible decimal portion)(% or s or word boundary) and not followed by '>' such as for color tags
      .matchAll(/(\d+\.?\d*)(?:(%)|s?\b)(?!>)/g),
  ].map((matches) => {
    const [_match, value, percent] = matches
    if (percent) return parseFloatBetter(value)
    return +value
  })
}
