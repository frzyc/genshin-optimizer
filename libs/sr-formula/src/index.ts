import type { AnyNode, RawTagMapEntries } from '@genshin-optimizer/pando'
import { compileTagMapValues, constant } from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { keys, values } from './data'

export function srCalculatorWithValues(extras: RawTagMapEntries<number>) {
  return srCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function srCalculatorWithEntries(extras: RawTagMapEntries<AnyNode>) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
