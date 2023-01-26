import { AnyNode, CompiledTagMapValues, compileTagMapValues, constant, RawTagMapEntries, ReRead } from '@genshin-optimizer/waverider'
import { keys, values } from './data.gen.json'
import { Calculator } from './calculator'

export function genshinCalculatorWithValues(extras: RawTagMapEntries<number>) {
  return genshinCalculatorWithEntries(extras.map(({ tag, value }) =>
    ({ tag, value: constant(value) })))
}
export function genshinCalculatorWithEntries(extras: RawTagMapEntries<AnyNode>) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values as any, extraEntries)
}
