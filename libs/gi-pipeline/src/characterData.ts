import type {
  LocationCharacterKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import type { CharacterId } from '@genshin-optimizer/dm'
import {
  ascensionData,
  avatarExcelConfigData,
  characterIdMap,
  fetterInfoExcelConfigData,
  propTypeMap,
  QualityTypeMap,
  weaponMap,
} from '@genshin-optimizer/dm'
import somniaData from './Somnia/data.json'

export type CharacterGrowCurveKey =
  | 'GROW_CURVE_HP_S4'
  | 'GROW_CURVE_ATTACK_S4'
  | 'GROW_CURVE_HP_S5'
  | 'GROW_CURVE_ATTACK_S5'
export type CharacterData = {
  weaponTypeKey: WeaponTypeKey
  base: {
    hp: number
    atk: number
    def: number
  }
  curves: {
    hp: CharacterGrowCurveKey
    atk: CharacterGrowCurveKey
    def: CharacterGrowCurveKey
  }
  star: 1 | 2 | 3 | 4 | 5
  ascensions: {
    props: { [key: string]: number }
  }[]
  birthday: {
    month?: number
    day?: number
  }
}
export type CharacterDatas = Record<LocationCharacterKey, CharacterData>
export default function characterData() {
  const data = Object.fromEntries(
    Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
      const {
        weaponType,
        qualityType,
        avatarPromoteId,
        hpBase,
        attackBase,
        defenseBase,
        propGrowCurves,
      } = charData
      const curves = Object.fromEntries(
        propGrowCurves.map(({ type, growCurve }) => [
          propTypeMap[type],
          growCurve,
        ])
      ) as CharacterData['curves']
      const { infoBirthDay, infoBirthMonth } = fetterInfoExcelConfigData[charid]
      const result: CharacterData = {
        weaponTypeKey: weaponMap[weaponType],
        base: { hp: hpBase, atk: attackBase, def: defenseBase },
        curves,
        birthday: { month: infoBirthMonth, day: infoBirthDay },
        star: QualityTypeMap[qualityType] ?? 5,
        ascensions: ascensionData[avatarPromoteId],
      }
      const charKey = characterIdMap[charid as unknown as CharacterId]
      return [charKey.startsWith('Traveler') ? 'Traveler' : charKey, result]
    })
  ) as CharacterDatas
  data.Somnia = somniaData as CharacterData
  return data
}
