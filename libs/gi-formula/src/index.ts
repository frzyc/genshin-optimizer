import type { AnyNode, TagMapEntries } from '@genshin-optimizer/pando'
import { compileTagMapValues, constant } from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { keys, values } from './data'
export * from './formulaText'
export * from './util'

export function genshinCalculatorWithValues(extras: TagMapEntries<number>) {
  return genshinCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function genshinCalculatorWithEntries(extras: TagMapEntries<AnyNode>) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
