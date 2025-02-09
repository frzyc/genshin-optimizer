import { usedNames, usedQ } from '@genshin-optimizer/game-opt/engine'
import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando/engine'
import artifact from './artifact'
import character from './char'
import common from './common'
import type { TagMapNodeEntries } from './util'
import { fixedTags, queryTypes } from './util'
import weapon from './weapon'

const entries: TagMapNodeEntries = [
  ...common,
  ...artifact,
  ...character,
  ...weapon,
]
const keys = compileTagMapKeys([
  { category: 'qt', values: queryTypes },
  { category: 'q', values: usedQ },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({
    category: k,
    values: new Set(v),
  })),
  { category: 'name', values: usedNames },
]) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, entries)

export { entries, keys, values }
