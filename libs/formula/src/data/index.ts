import { compileTagMapKeys, compileTagMapValues } from '@genshin-optimizer/waverider'
import artifact from './artifact'
import character from './char'
import common from './common'
import { Data, fixedTags, queries, queryTypes, usedNames } from './util'
import weapon from './weapon'

const data: Data = [...common, ...artifact, ...character, ...weapon]
const tags = [
  { category: 'qt', values: queryTypes },
  { category: 'q', values: [...queries] },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({ category: k, values: v })),
  { category: 'name', values: [...usedNames] },
  { category: 'todo', values: ['TODO'] },
]
const keys = compileTagMapKeys(tags) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, data)

export { keys, values }
