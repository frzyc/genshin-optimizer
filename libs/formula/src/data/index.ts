import { compileTagMapKeys, compileTagMapValues } from "@genshin-optimizer/waverider"
import artifact from "./artifact"
import character from "./character"
import common from "./common"
import { Data, fixedQueries, fixedTags, usedCustomTags, usedNames } from "./util"
import weapon from "./weapon"

const data: Data = [...common, ...artifact, ...character, ...weapon]
const tags = [
  ...Object.entries(fixedTags).map(([k, v]) => ({ category: k, values: v })),
  { category: 'qt', values: [...Object.keys(fixedQueries), 'misc'] },
  { category: 'q', values: [...usedCustomTags, ...Object.values(fixedQueries).flat()] },
  { category: 'name', values: [...usedNames] },
  { category: 'todo', values: ["TODO"] },
]
const keys = compileTagMapKeys(tags) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, data)

export { keys, values }
