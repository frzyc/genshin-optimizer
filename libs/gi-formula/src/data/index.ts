import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando'
import artifact from './artifact'
import character from './char'
import common from './common'
import type { TaggedFormulas } from './util'
import { fixedTags, queries, queryTypes, usedNames } from './util'
import weapon from './weapon'

const data: TaggedFormulas = [...common, ...artifact, ...character, ...weapon]
const tags = [
  { category: 'qt', values: [...queryTypes] },
  { category: 'q', values: ['_', ...queries] },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({ category: k, values: v })),
  { category: 'name', values: [...usedNames] },
]
const keys = compileTagMapKeys(tags) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, data)

export { keys, values, data }
