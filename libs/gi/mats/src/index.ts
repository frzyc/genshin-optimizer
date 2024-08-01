import type { AscensionKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import * as allCharacterMats_gen from './allCharacterMats_gen.json'
import type {
  CharacterMatDatas,
  UpgradeCost,
} from './executors/gen-mats/executor'

const allCharacterMats = allCharacterMats_gen as CharacterMatDatas

export { allCharacterMats }

export function getCharAscMat(
  char: CharacterKey,
  asc: AscensionKey
): UpgradeCost | undefined {
  if (!(char in allCharacterMats)) return undefined

  return allCharacterMats[char].ascension[asc]
}
