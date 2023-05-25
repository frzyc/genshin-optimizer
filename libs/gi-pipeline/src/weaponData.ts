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
import quantumCatalystData from './QuantumCatalyst/data.json'

type WeaponProp = {
  type: StatKey
  base: number
  curve: WeaponGrowCurveKey
}
export type WeaponData = {
  weaponType: WeaponTypeKey
  rarity: 1 | 2 | 3 | 4 | 5
  mainStat: WeaponProp
  subStat?: WeaponProp
  addProps: Partial<Record<StatKey, number>>[]
  ascension: { addStats: Partial<Record<StatKey, number>> }[]
}

export default function weaponData() {
  const data = Object.fromEntries(
    Object.entries(weaponExcelConfigData).map(([weaponid, weaponData]) => {
      const { weaponType, rankLevel, weaponProp, skillAffix, weaponPromoteId } =
        weaponData
      const [main, sub] = weaponProp
      const [refinementDataId] = skillAffix
      const refData =
        refinementDataId && equipAffixExcelConfigData[refinementDataId]

      const ascData = weaponPromoteExcelConfigData[weaponPromoteId]

      const result: WeaponData = {
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
        addProps: refData
          ? refData.map((asc) =>
              Object.fromEntries(
                asc.addProps
                  .filter((ap) => 'value' in ap)
                  .map((ap) => [
                    propTypeMap[ap.propType] ?? ap.propType,
                    extrapolateFloat(ap.value),
                  ])
              )
            )
          : [],
        ascension: ascData.map((asd) => {
          if (!asd) return { addStats: {} }
          return {
            addStats: Object.fromEntries(
              asd.addProps
                .filter((a) => a.value && a.propType)
                .map((a) => [
                  propTypeMap[a.propType],
                  extrapolateFloat(a.value),
                ])
            ),
          }
        }) as any,
      }
      return [weaponIdMap[weaponid], result]
    })
  ) as Record<WeaponKey, WeaponData>
  data.QuantumCatalyst = quantumCatalystData as WeaponData
  return data
}
