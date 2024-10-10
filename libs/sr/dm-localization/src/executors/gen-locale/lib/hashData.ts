import { verifyObjKeys } from '@genshin-optimizer/common/util'
import {
  allCharacterDataKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import { charHashData } from './charHashData'
import { commonHashData } from './commonHashData'
import { lightConeHashData } from './lightConeHashData'
import { relicHashData } from './relicHashData'
import { uiHashData } from './uiHashData'

export type LanguageData = typeof HashData

const charNames = Object.fromEntries(
  Object.entries(charHashData).map(([key, data]) => [key, data.name])
)
verifyObjKeys(charNames, allCharacterDataKeys)

const relicNames = Object.fromEntries(
  Object.entries(relicHashData).map(([key, data]) => [key, data.setName])
)
verifyObjKeys(relicNames, allRelicSetKeys)

const lightConeNames = Object.fromEntries(
  Object.entries(lightConeHashData).map(([key, data]) => [key, data.name])
)
verifyObjKeys(lightConeNames, allLightConeKeys)

export const HashData = {
  char: charHashData,
  charNames,

  relic: relicHashData,
  relicNames,

  lightCone: lightConeHashData,
  lightConeNames,

  common: commonHashData,
  ui: uiHashData,
}
