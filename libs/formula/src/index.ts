import type { AnyNode, RawTagMapEntries, ReRead } from '@genshin-optimizer/waverider'
import { compileTagMapValues, constant } from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
export * from './formulaText'
export * from './util'
export * from './data/util'
export { Calculator } from './calculator'

export function genshinCalculatorWithValues(extras: RawTagMapEntries<number>) {
  return genshinCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function genshinCalculatorWithEntries(
  extras: RawTagMapEntries<AnyNode| ReRead>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
