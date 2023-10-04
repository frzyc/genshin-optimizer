import type { AnyNode, ReRead, TagMapEntries } from '@genshin-optimizer/pando'
import { compileTagMapValues, constant } from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { keys, values } from './data'
export type { CalcMeta } from './calculator'
export { Calculator } from './calculator'
export * from './data/util'
export * from './formulaText'
export * from './util'

export function genshinCalculatorWithValues(extras: TagMapEntries<number>) {
  return genshinCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function genshinCalculatorWithEntries(
  extras: TagMapEntries<AnyNode | ReRead>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
