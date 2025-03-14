import type {
  AnyNode,
  ReRead,
  TagMapEntries,
} from '@genshin-optimizer/pando/engine'
import {
  addCustomOperation,
  compileTagMapValues,
  constant,
  TagMapSubset,
} from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { Tag } from './data/util'
export { Calculator } from './calculator'
export * from './conditionalUtil'
export * from './data/util'
export * from './meta'
export * from './util'

{
  const floor = (args: (number | string)[]): number => {
    const x = args[0] as number
    return Math.floor(x)
  }
  addCustomOperation('floor', {
    range: ([r]) => ({ min: floor([r.max]), max: floor([r.min]) }),
    monotonicity: () => [{ inc: true, dec: false }],
    calc: floor,
  })
}

export function srCalculatorWithValues(extras: TagMapEntries<number>) {
  return srCalculatorWithEntries(
    extras.map(({ tag, value }) => ({ tag, value: constant(value) })),
  )
}
export function srCalculatorWithEntries(
  extras: TagMapEntries<AnyNode | ReRead>,
) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values, extraEntries)
}

/**
 * Create a Tag Map that allows looking up a value using a tag
 */
export function createTagMap<V>(values: Array<{ tag: Tag; value: V }>) {
  return new TagMapSubset(keys, compileTagMapValues(keys, values))
}
