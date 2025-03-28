import type {
  ElementKey,
  LocationCharacterKey,
  RegionKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import type { CharacterId, StatKey } from '@genshin-optimizer/gi/dm'
import {
  QualityTypeMap,
  ascensionData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  characterIdMap,
  elementMap,
  fetterInfoExcelConfigData,
  propTypeMap,
  regionMap,
  weaponMap,
} from '@genshin-optimizer/gi/dm'
import * as somniaData from './Somnia/data.json'

export type CharacterGrowCurveKey =
  | 'GROW_CURVE_HP_S4'
  | 'GROW_CURVE_ATTACK_S4'
  | 'GROW_CURVE_HP_S5'
  | 'GROW_CURVE_ATTACK_S5'
export type CharacterDataGen = {
  key: LocationCharacterKey
  ele?: ElementKey | undefined
  region?: RegionKey | undefined
  weaponType: WeaponTypeKey
  lvlCurves: {
    key: 'hp' | 'atk' | 'def'
    base: number
    curve: CharacterGrowCurveKey
  }[]
  rarity: 1 | 2 | 3 | 4 | 5
  ascensionBonus: { [key in StatKey]?: number[] }
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
      ) as Record<'hp' | 'atk' | 'def', CharacterGrowCurveKey>
      const { infoBirthDay, infoBirthMonth, avatarAssocType } =
        fetterInfoExcelConfigData[charid]
      const skillDepot = avatarSkillDepotExcelConfigData[skillDepotId]
      const burstInfo = avatarSkillExcelConfigData[skillDepot.energySkill]
      const ascensions = ascensionData[avatarPromoteId]

      const ascensionBonus: CharacterDataGen['ascensionBonus'] = {}
      const emptyBonus = new Array(ascensions.length).fill(0)
      ascensions.forEach((data, i) => {
        for (const [k, value] of Object.entries(data.props)) {
          const key = k as StatKey
          if (!(key in ascensionBonus)) ascensionBonus[key] = [...emptyBonus]
          ascensionBonus[key]![i] += value
        }
      })

      const result: CharacterDataGen = {
        key: locCharKey,
        ele: burstInfo ? elementMap[burstInfo.costElemType] : undefined, // Traveler will be undefined
        region: regionMap[avatarAssocType],
        weaponType: weaponMap[weaponType],
        birthday: { month: infoBirthMonth, day: infoBirthDay },
        rarity: QualityTypeMap[qualityType] ?? 5,
        lvlCurves: [
          { key: 'hp', base: hpBase, curve: curves.hp },
          { key: 'atk', base: attackBase, curve: curves.atk },
          { key: 'def', base: defenseBase, curve: curves.def },
        ],
        ascensionBonus,
      }
      return [locCharKey, result]
    })
  ) as CharacterDatas
  data.Somnia = somniaData as CharacterDataGen

  // Hakushin stats
  // for (const key of hakushinChars) {
  //   data[key] = getDataFromHakushin(key)
  // }

  return data
}

// function getDataFromHakushin(key: NonTravelerCharacterKey) {
//   const data = getHakushinCharData(key)

//   const bases = [data.BaseHP, data.BaseATK, data.BaseDEF]
//   const ascension: CharacterDataGen['ascensionBonus'] = {}
//   for (const asc of data.StatsModifier.Ascension) {
//     for (const [prop, value] of Object.entries(asc)) {
//       const statKey = propTypeMap[prop]
//       if (!ascension[statKey]) ascension[statKey] = [0]
//       ascension[statKey].push(value)
//     }
//   }
//   const stats: CharacterDataGen = {
//     key,
//     ele: elementMap[data.CharaInfo.Vision],
//     region: regionMap[data.CharaInfo.Region],
//     weaponType: weaponMap[data.Weapon],
//     birthday: {
//       month: data.CharaInfo.Birth[0],
//       day: data.CharaInfo.Birth[1],
//     },
//     rarity: QualityTypeMap[data.Rarity],
//     lvlCurves: data.StatsModifier.PropGrowCurves.map((curve, index) => ({
//       key: propTypeMap[curve.type],
//       base: bases[index],
//       curve: curve.growCurve,
//     })),
//     ascensionBonus: ascension,
//   }

//   return stats
// }
