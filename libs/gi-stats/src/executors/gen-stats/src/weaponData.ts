import type { WeaponKey } from '@genshin-optimizer/consts'
import type {
  StatKey,
  WeaponGrowCurveKey,
  WeaponTypeKey,
} from '@genshin-optimizer/dm'
import {
  equipAffixExcelConfigData,
  propTypeMap,
  weaponExcelConfigData,
  weaponIdMap,
  weaponMap,
  weaponPromoteExcelConfigData,
} from '@genshin-optimizer/dm'
import { extrapolateFloat } from '@genshin-optimizer/pipeline'
import * as quantumCatalystData from './QuantumCatalyst/data.json'

type WeaponProp = {
  type: StatKey
  base: number
  curve: WeaponGrowCurveKey
}
export type WeaponDataGen = {
  weaponType: WeaponTypeKey
  rarity: 1 | 2 | 3 | 4 | 5
  mainStat: WeaponProp
  subStat?: WeaponProp | undefined
  lvlCurves: { key: string; base: number; curve: WeaponGrowCurveKey }[]
  refinementBonus: { [key in string]: number[] }
  ascensionBonus: { [key in string]: number[] }
}

export default function weaponData() {
  const data = Object.fromEntries(
    Object.entries(weaponExcelConfigData).map(([weaponid, weaponData]) => {
      const { weaponType, rankLevel, weaponProp, skillAffix, weaponPromoteId } =
        weaponData
      const [main, sub] = weaponProp
      const [refinementDataId] = skillAffix
      const refData = refinementDataId
        ? equipAffixExcelConfigData[refinementDataId]
        : []
      const ascData = weaponPromoteExcelConfigData[weaponPromoteId]

      const refinementBonus: WeaponDataGen['refinementBonus'] = {}
      // Use -1 as placeholder for debugging purpose
      const emptyRefinement = [-1, ...new Array(refData.length).fill(0)]
      refData.forEach((data, i) => {
        for (const { propType, value } of data.addProps) {
          if (!propType || !value) continue
          const key = propTypeMap[propType]
          if (!(key in refinementBonus))
            refinementBonus[key] = [...emptyRefinement]
          // Refinement uses 1-based index, hence the +1
          refinementBonus[key][i + 1] += extrapolateFloat(value)
        }
      })
      const ascensionBonus: WeaponDataGen['ascensionBonus'] = {}
      const emptyAscension = new Array(ascData.length).fill(0)
      ascData.forEach((data, i) => {
        for (const { propType, value } of data?.addProps ?? []) {
          if (!propType || !value) continue
          const key = propTypeMap[propType]
          if (!(key in ascensionBonus))
            ascensionBonus[key] = [...emptyAscension]
          ascensionBonus[key][i] += extrapolateFloat(value)
        }
      })

      const result: WeaponDataGen = {
        weaponType: weaponMap[weaponType],
        rarity: rankLevel,
        mainStat: {
          type: propTypeMap[main.propType],
          base: extrapolateFloat(main.initValue),
          curve: main.type,
        },
        subStat: sub.propType
          ? {
              type: propTypeMap[sub.propType],
              base: extrapolateFloat(sub.initValue),
              curve: sub.type,
            }
          : undefined,
        lvlCurves: [
          {
            key: propTypeMap[main.propType],
            base: extrapolateFloat(main.initValue),
            curve: main.type,
          },
          ...(sub.propType
            ? [
                {
                  key: propTypeMap[sub.propType],
                  base: extrapolateFloat(sub.initValue),
                  curve: sub.type,
                },
              ]
            : []),
        ],
        refinementBonus,
        ascensionBonus,
      }
      return [weaponIdMap[weaponid], result]
    })
  ) as Record<WeaponKey, WeaponDataGen>
  data.QuantumCatalyst = quantumCatalystData as WeaponDataGen
  return data
}
