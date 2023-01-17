import { AnyNode, compileTagMapKeys, compileTagMapValues, RawTagMapEntries, tagMapValuesToJSON } from "@genshin-optimizer/waverider/preprocess"
import artifact from "./artifact"
import character from "./character"
import common from "./common"
import { reader, stats, usedTags } from "./util"
import weapon from "./weapon"

const data: RawTagMapEntries<AnyNode> = [...common, ...artifact, ...character, ...weapon]
const tags = [
  ...Object.entries(usedTags).flatMap(([k, v]) => [...v].map(v => ({ [k]: v }))),
  ...stats.map(s => reader.q(s).tag),
]
const keys = compileTagMapKeys([...tags, { todo: "TODO" }], []) // TODO: Find optimum tag order
const preValues = tagMapValuesToJSON(compileTagMapValues(keys, data))

export { keys, preValues }
