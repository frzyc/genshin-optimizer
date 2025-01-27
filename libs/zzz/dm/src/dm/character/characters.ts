import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { nameToKey, objFilter, objMap } from '@genshin-optimizer/common/util'
import { PROJROOT_PATH } from '../../consts'
import { readHakushinJSON } from '../../util'

const charctersJsonData = JSON.parse(
  readHakushinJSON('character.json')
) as Record<
  string,
  {
    code: string
    rank: number // => CharacterRarityKey
    type: number // => SpecialityKey
    hit: number // =>AttackTypeKey
  }
>

const characterIdMap = objFilter(
  objMap(charctersJsonData, ({ code }) => nameToKey(code)),
  (key) => !!key && !['Belle', 'Wise'].includes(key)
)

dumpPrettyFile(
  `${PROJROOT_PATH}/src/dm/character/characterIdMap.json`,
  characterIdMap
)
dumpPrettyFile(
  `${PROJROOT_PATH}/src/dm/character/characterKeys.json`,
  Object.values(characterIdMap).sort()
)

export { charctersJsonData }
