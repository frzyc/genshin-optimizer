import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import { type TagMapNodeEntries } from '../util'
import AstralVoice from './sheets/AstralVoice'
import { entriesForDisc, registerDisc } from './util'

const data: TagMapNodeEntries[] = [
  ...allDiscSetKeys.map((set) => registerDisc(set, entriesForDisc(set))),
  AstralVoice,
]
export default data.flat()
