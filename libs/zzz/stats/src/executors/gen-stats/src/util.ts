import { parseFloatBetter } from '@genshin-optimizer/common/util'

export function extractParamsFromString(str: string) {
  return [...str.matchAll(/(\d+\.?\d*)(?:(%)|s?\b)(?!>)/g)].map((matches) => {
    const [_match, value, percent] = matches
    if (percent) return parseFloatBetter(value)
    return +value
  })
}
