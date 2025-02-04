import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { register, type TagMapNodeEntries } from '../util'
import { entriesForWengine } from './util'

const data: TagMapNodeEntries[] = allWengineKeys.map((weng) =>
  register(weng, entriesForWengine(weng))
)

export default data.flat()
