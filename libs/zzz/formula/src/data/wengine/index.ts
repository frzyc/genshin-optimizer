import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { type TagMapNodeEntries } from '../util'
import { entriesForWengine, registerWengine } from './util'

const data: TagMapNodeEntries[] = allWengineKeys.map((weng) =>
  registerWengine(weng, entriesForWengine(weng))
)

export default data.flat()
