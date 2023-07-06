import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando'
import artifact from './artifact'
import character from './char'
import common from './common'
import type { TagMapNodeEntries } from './util'
import { fixedTags, queryTypes, reader } from './util'
import weapon from './weapon'

const data: TagMapNodeEntries = [
  ...common,
  ...artifact,
  ...character,
  ...weapon,
]
const keys = compileTagMapKeys([
  { category: 'qt', values: queryTypes },
  { category: 'q', values: reader.usedTags('q') },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({
    category: k,
    values: new Set(v),
  })),
  { category: 'name', values: reader.usedTags('name') },
]) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, data)

export { data, keys, values }
