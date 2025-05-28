import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { allStats } from '@genshin-optimizer/zzz/stats'
import { type TagMapNodeEntries, register } from '../util'
import Anby from './sheets/Anby'
import { entriesForChar } from './util'

const sheetedChars: CharacterKey[] = ['Anby']

const data: TagMapNodeEntries[] = shouldShowDevComponents
  ? allCharacterKeys.map((key) =>
      register(key, entriesForChar(allStats.char[key]))
    )
  : [
      ...allCharacterKeys
        .filter((k) => !sheetedChars.includes(k))
        .map((key) => register(key, entriesForChar(allStats.char[key]))),
      Anby,
    ]
export default data.flat()
