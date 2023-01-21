import { compileTagMapKeys, compileTagMapValues, tagMapValuesToJSON } from "@genshin-optimizer/waverider/preprocess"
import artifact from "./artifact"
import character from "./character"
import common from "./common"
import { Data, dsts, elements, entryTypes, fixedQueries, fixedTags, regions, srcs, usedCustomTags } from "./util"
import weapon from "./weapon"


const data: Data = [...common, ...artifact, ...character, ...weapon]
const tags = [
  ...Object.entries(fixedTags).flatMap(([k, v]) => v.map(v => ({ [k]: v }))),
  ...Object.entries(fixedQueries).flatMap(([qt, q]) => q.map(q => ({ qt, q }))),
  ...[...usedCustomTags].map(q => ({ q })),
  ...data.map(data => data.tag),
  { todo: "TODO" },
]
const keys = compileTagMapKeys(tags, []) // TODO: Find optimum tag order
const preValues = tagMapValuesToJSON(compileTagMapValues(keys, data))

export { keys, preValues }
