import { verifyObjKeys } from '@genshin-optimizer/common/util'
import {
  allCharacterGenderedKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import { allCharHashData, charHashData, charSheet } from './charHashData'
import { allLightConeHashData, lightConeHashData } from './lightConeHashData'
import { allRelicHashData, relicHashData } from './relicHashData'
import { uiHashData } from './uiHashData'

export type LanguageData = typeof HashData

const charNames = Object.fromEntries(
  Object.entries(allCharHashData).map(([key, data]) => [key, data.name])
)
verifyObjKeys(charNames, allCharacterGenderedKeys)

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
  charSheet,

  relic: allRelicHashData,
  relicNames,
  relics: relicHashData,

  lightCone: allLightConeHashData,
  lightConeNames,
  lightCones: lightConeHashData,

  ui: uiHashData,

  common: {
    level: '5833980347051014026', // Level
    lv: '6432248371558474859', // Lv.
    path_one: '16437605064767516057', // Path
    path_other: '15566938724422251912', // Paths
    rarity: '10776505875408737758',
  },

  statKey: {
    spd: '1551664918081489046',
    spd_: '1551664918081489046',
    hp: '6221757978868999847',
    hp_: '6221757978868999847',
    atk: '5944307725021040882',
    atk_: '5944307725021040882',
    def: '8932885934187978117',
    def_: '8932885934187978117',
    crit_: '8920628846043734901',
    crit_dmg_: '9616567210782620870',
    brEffect_: '12291598457447136965',
    eff_: '11272223239254419789',
    eff_res_: '4333504174252709265',
    enerRegen_: '9497329997440666192',
    heal_: '6870358963948712726',
    physical_dmg_: '12236102685634728712',
    fire_dmg_: '6217159245313749913',
    ice_dmg_: '14590633397294595254',
    wind_dmg_: '17570598288988869779',
    lightning_dmg_: '562985858704247780',
    quantum_dmg_: '14382067715181772946',
    imaginary_dmg_: '6916881987242258396',
    dmg_: '15983140579213054709',
    weakness_: '1118831856511100259',
    resPen_: '908412531652996285',
  },

  teams: {
    team: '17397759760626194356', // Team
    name: '17411511948024426109', // Team Name
    editTeam: '5003704226092642529',
  },
}
