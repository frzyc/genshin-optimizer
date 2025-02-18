import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import { type TagMapNodeEntries } from '../util'
import discs from './disc'
import { entriesForDisc, registerDisc } from './util'
const data: TagMapNodeEntries[] = allDiscSetKeys.map((set) =>
  registerDisc(set, entriesForDisc(set))
)
export default [...data.flat(), ...discs]
