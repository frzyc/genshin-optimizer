import { verifyObjKeys } from '@genshin-optimizer/common/util'
import {
  allCharacterDataKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import { allCharHashData, charHashData } from './charHashData'
import { allLightConeHashData, lightConeHashData } from './lightConeHashData'
import { allRelicHashData, relicHashData } from './relicHashData'
import { uiHashData } from './uiHashData'

export type LanguageData = typeof HashData

const charNames = Object.fromEntries(
  Object.entries(allCharHashData).map(([key, data]) => [key, data.name])
)
verifyObjKeys(charNames, allCharacterDataKeys)

const relicNames = Object.fromEntries(
  Object.entries(allRelicHashData).map(([key, data]) => [key, data.setName])
)
verifyObjKeys(relicNames, allRelicSetKeys)

const lightConeNames = Object.fromEntries(
  Object.entries(allLightConeHashData).map(([key, data]) => [key, data.name])
)
verifyObjKeys(lightConeNames, allLightConeKeys)

export const HashData = {
  char: allCharHashData,
  charNames,
  characters: charHashData,

  relic: allRelicHashData,
  relicNames,
  relics: relicHashData,

  lightCone: allLightConeHashData,
  lightConeNames,
  lightCones: lightConeHashData,

  ui: uiHashData,

  common: {
    level: '-636045037', // Level
    lv: '982642653', // Lv.
    path_one: '-1952347303', // Path
    path_other: '-815380608', // Paths
    rarity: '1898197464',
  },

  statKey: {
    spd: '461357812',
    spd_: '461357812',
    hp: '-1544419067',
    hp_: '-1544419067',
    atk: '-1126979077',
    atk_: '-1126979077',
    def: '-615378225',
    def_: '-615378225',
    crit_: '528301800',
    crit_dmg_: '-220753499',
    brEffect_: '-1668395853',
    eff_: '284076746',
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
    dmg_: '-907763317',
    weakness_: '-1297647890',
    resPen_: '-538204877',
  },

  teams: {
    team: '-839489437', // Team
    name: '858715661', // Team Name
    editTeam: '-756448810',
  },
}
