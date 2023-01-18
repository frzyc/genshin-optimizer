import { compileTagMapKeys, compileTagMapValues, tagMapValuesToJSON } from "@genshin-optimizer/waverider/preprocess"
import artifact from "./artifact"
import character from "./character"
import common from "./common"
import { Data, fixedCats, usedCustomTags } from "./util"
import weapon from "./weapon"

const data: Data = [...common, ...artifact, ...character, ...weapon]
const tags = [
  ...Object.entries(fixedCats).flatMap(([k, v]) => v.map(v => ({ [k]: v }))),
  ...[...usedCustomTags].map(q => ({ q })),
]
const keys = compileTagMapKeys([...tags, { todo: "TODO" }], []) // TODO: Find optimum tag order
const preValues = tagMapValuesToJSON(compileTagMapValues(keys, data))

export { keys, preValues }
