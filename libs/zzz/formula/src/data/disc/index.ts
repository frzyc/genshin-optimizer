import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import { register, type TagMapNodeEntries } from '../util'
import { entriesForDisc } from './util'

import AstralVoice from './sheets/AstralVoice'
const data: TagMapNodeEntries[] = [
  ...allDiscSetKeys.map((set) => register(set, entriesForDisc(set))),
  AstralVoice,
]
export default data.flat()
