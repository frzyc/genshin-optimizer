import { AnyNode, compileTagMapValues, constant, jsonToTagMapValues, RawTagMapEntries } from "@genshin-optimizer/waverider";
import { keys, preValues } from "./data.gen.json";
import { Calculator } from "./calculator"

const values = jsonToTagMapValues<AnyNode>(preValues)

export function genshinCalculatorWithValues(extras: RawTagMapEntries<number>) {
  return genshinCalculatorWithEntries(extras.map(({ tag, value }) =>
    ({ tag, value: constant(value) })))
}
export function genshinCalculatorWithEntries(extras: RawTagMapEntries<AnyNode>) {
  const extraEntries = compileTagMapValues(keys, extras)
  return new Calculator(keys, values, extraEntries)
}
