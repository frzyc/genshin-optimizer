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
export * from './formulaCatalog'
export * from './formulaCatalogBuild'
export * from './formulaRef'
export * from './formulaText'
export * from './meta'
export * from './util'

{
  const res = (args: (number | string)[]): number => {
    const x = args[0] as number
    if (x >= 0.75) return 1 / (1 + 4 * x)
    if (x >= 0) return 1 - x
    return 1 - 0.5 * x
  }
  addCustomOperation('res', {
    range: ([r]) => ({ min: res([r.max]), max: res([r.min]) }),
    monotonicity: (_) => [{ inc: false, dec: true }],
    calc: res,
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

/** Create a Tag Map that allows looking up a value using a tag. */
export function createTagMap<V>(entries: Array<{ tag: Tag; value: V }>) {
  return new TagMapSubset(keys, compileTagMapValues(keys, entries))
}
