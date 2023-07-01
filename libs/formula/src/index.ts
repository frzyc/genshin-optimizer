import type { AnyNode, RawTagMapEntries } from '@genshin-optimizer/waverider'
import { compileTagMapValues, constant } from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
export * from './formulaText'
export * from './util'

export function genshinCalculatorWithValues(extras: RawTagMapEntries<number>) {
  return genshinCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function genshinCalculatorWithEntries(
  extras: RawTagMapEntries<AnyNode>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
