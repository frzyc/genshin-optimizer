import type {
  AnyNode,
  ReRead,
  TagMapEntries,
} from '@genshin-optimizer/pando/engine'
import { compileTagMapValues, constant } from '@genshin-optimizer/pando/engine'

import { Calculator } from './calculator'
import { keys, values } from './data'
export { Calculator } from './calculator'
export * from './data/util'
export * from './debug'
export * from './util'

export function srCalculatorWithValues(extras: TagMapEntries<number>) {
  return srCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) }))
  )
}
export function srCalculatorWithEntries(
  extras: TagMapEntries<AnyNode | ReRead>
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
