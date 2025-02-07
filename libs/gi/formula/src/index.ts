import type {
  AnyNode,
  ReRead,
  TagMapEntries,
} from '@genshin-optimizer/pando/engine'
import {
  compileTagMapValues,
  constant,
  setCustomFormula,
} from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { keys, values } from './data'
export { Calculator } from './calculator'
export type { CalcMeta, SrcCondInfo } from './calculator'
export * from './data/util'
export * from './formulaText'
export * from './meta'
export * from './util'

{
  // Hook the custom formula at once the beginning
  const calc = (args: (number | string)[]): number => {
    const x = args[0] as number
    if (x >= 0.75) return 1 / (1 + 4 * x)
    if (x >= 0) return 1 - x
    return 1 - 0.5 * x
  }
  setCustomFormula('res', {
    range: ([r]) => ({ min: calc([r.max]), max: calc([r.min]) }),
    tonicity: (_) => [{ inc: false, dec: true }],
    calc,
  })
}

export function genshinCalculatorWithValues(extras: TagMapEntries<number>) {
  return genshinCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function genshinCalculatorWithEntries(
  extras: TagMapEntries<AnyNode | ReRead>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values, extraEntries)
}
