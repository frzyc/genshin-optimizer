import type {
  ElementKey,
  LocationCharacterKey,
  RegionKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import type { CharacterId, StatKey } from '@genshin-optimizer/dm'
import {
  ascensionData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  characterIdMap,
  elementMap,
  fetterInfoExcelConfigData,
  propTypeMap,
  QualityTypeMap,
  regionMap,
  weaponMap,
} from '@genshin-optimizer/dm'
import somniaData from './Somnia/data.json'

export type CharacterGrowCurveKey =
  | 'GROW_CURVE_HP_S4'
  | 'GROW_CURVE_ATTACK_S4'
  | 'GROW_CURVE_HP_S5'
  | 'GROW_CURVE_ATTACK_S5'
export type CharacterDataGen = {
  key: LocationCharacterKey
  ele?: ElementKey
  region?: RegionKey
  weaponType: WeaponTypeKey
  lvlCurves: {
    key: 'hp' | 'atk' | 'def'
    base: number
    curve: CharacterGrowCurveKey
  }[]
  /**
   * @deprecated
   */
  base: {
    hp: number
    atk: number
    def: number
  }
  /**
   * @deprecated
   */
  curves: {
    hp: CharacterGrowCurveKey
    atk: CharacterGrowCurveKey
    def: CharacterGrowCurveKey
  }
  rarity: 1 | 2 | 3 | 4 | 5
  ascensionBonus: { key: StatKey; values: number[] }[]
  /**
   * @deprecated
   */
  ascensions: {
    props: { [key: string]: number }
  }[]
  birthday: {
    month?: number
    day?: number
  }
}
export type CharacterDatas = Record<LocationCharacterKey, CharacterDataGen>
export default function characterData() {
  const data = Object.fromEntries(
    Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
      const charKey = characterIdMap[charid as unknown as CharacterId]
      const locCharKey = charKey.startsWith('Traveler')
        ? 'Traveler'
        : (charKey as LocationCharacterKey)
      const {
        weaponType,
        qualityType,
        avatarPromoteId,
        hpBase,
        attackBase,
        defenseBase,
        propGrowCurves,
        skillDepotId,
      } = charData
      const curves = Object.fromEntries(
        propGrowCurves.map(({ type, growCurve }) => [
          propTypeMap[type],
          growCurve,
        ])
      ) as CharacterDataGen['curves']
      const { infoBirthDay, infoBirthMonth, avatarAssocType } =
        fetterInfoExcelConfigData[charid]
      const skillDepot = avatarSkillDepotExcelConfigData[skillDepotId]
      const burstInfo = avatarSkillExcelConfigData[skillDepot.energySkill]
      const ascensions = ascensionData[avatarPromoteId]
      const ascensionKeys = new Set(
        ascensions.flatMap((a) => Object.keys(a.props))
      )
      const result: CharacterDataGen = {
        key: locCharKey,
        ele: burstInfo ? elementMap[burstInfo.costElemType] : undefined, // Traveler will be undefined
        region: regionMap[avatarAssocType],
        weaponType: weaponMap[weaponType],
        base: { hp: hpBase, atk: attackBase, def: defenseBase },
        curves,
        birthday: { month: infoBirthMonth, day: infoBirthDay },
        rarity: QualityTypeMap[qualityType] ?? 5,
        ascensions: ascensionData[avatarPromoteId],
        lvlCurves: [
          { key: 'hp', base: hpBase, curve: curves.hp },
          { key: 'atk', base: attackBase, curve: curves.atk },
          { key: 'def', base: defenseBase, curve: curves.def },
        ],
        ascensionBonus: [...ascensionKeys].map((key) => ({
          key: key as StatKey,
          values: ascensions.map((a) => a.props[key] ?? 0),
        })),
      }
      return [locCharKey, result]
    })
  ) as CharacterDatas
  data.Somnia = somniaData as CharacterDataGen
  return data
}
