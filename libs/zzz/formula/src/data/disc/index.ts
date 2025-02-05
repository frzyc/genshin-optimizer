import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import { register, type TagMapNodeEntries } from '../util'
import { entriesForDisc } from './util'

const data: TagMapNodeEntries[] = allDiscSetKeys.map((set) =>
  register(set, entriesForDisc(set))
)
export default data.flat()
