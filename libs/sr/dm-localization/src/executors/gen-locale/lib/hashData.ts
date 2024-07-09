import { verifyObjKeys } from '@genshin-optimizer/common/util'
import {
  allCharacterDataKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import { charHashData } from './charHashData'
import { lightConeHashData } from './lightConeHashData'
import { relicHashData } from './relicHashData'
import { sheetHashData } from './sheetHashData'

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

  sheet: sheetHashData,
  statKey: {
    spd: '461357812',
    hp: '-1544419067',
    atk: '-1126979077',
    def: '-615378225',
    crit_: '528301800',
    crit_dmg_: '-220753499',
    brEff_: '-1668395853',
    eff_: '-1886906656',
    eff_res_: '-952827954',
    enerRegen_: '-1155541365',
    heal_: '799727458',
    physical_dmg_: '-950888303',
    fire_dmg_: '1202183228',
    ice_dmg_: '1448585423',
    wind_dmg_: '2017136070',
    lightning_dmg_: '235195444',
    quantum_dmg_: '1819458027',
    imaginary_dmg_: '1031064451',
  },
}
