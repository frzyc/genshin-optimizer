import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { allStats } from '@genshin-optimizer/zzz/stats'
import { type TagMapNodeEntries, register } from '../util'
import { entriesForChar } from './util'

const data: TagMapNodeEntries[] = allCharacterKeys.map((key) =>
  register(key, entriesForChar(allStats.char[key]))
)
export default data.flat()
