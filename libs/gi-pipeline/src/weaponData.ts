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
export type WeaponDataGen = {
  weaponType: WeaponTypeKey
  rarity: 1 | 2 | 3 | 4 | 5
  mainStat: WeaponProp
  subStat?: WeaponProp
  lvlCurves: { key: string; base: number; curve: WeaponGrowCurveKey }[]
  refinementBonus: { key: string; values: number[] }[]
  ascensionBonus: { key: string; values: number[] }[]
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
      const refKeys = new Set(
        refData
          .filter((x) => x)
          .flatMap((ref) =>
            ref.addProps
              .filter((a) => a.value && a.propType)
              .map((p) => p.propType)
          )
      )
      const ascData = weaponPromoteExcelConfigData[weaponPromoteId]
      const ascKeys = new Set(
        ascData
          .filter((x): x is NonNullable<typeof x> => x != null)
          .flatMap((asc) =>
            asc.addProps
              .filter((a) => a.value && a.propType)
              .map((a) => a.propType)
          )
      )

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
        refinementBonus: [...refKeys].map((key) => ({
          key: propTypeMap[key],
          values: [
            -1,
            ...refData.map(
              (x) =>
                x.addProps.reduce(
                  (accu, x) =>
                    x.propType === key
                      ? accu + extrapolateFloat(x.value)
                      : accu,
                  0
                ) ?? 0
            ),
          ],
        })),
        ascensionBonus: [...ascKeys].map((key) => ({
          key: propTypeMap[key],
          values: ascData.map(
            (x) =>
              x?.addProps.reduce(
                (accu, x) =>
                  x.propType === key ? accu + extrapolateFloat(x.value) : accu,
                0
              ) ?? 0
          ),
        })),
      }
      return [weaponIdMap[weaponid], result]
    })
  ) as Record<WeaponKey, WeaponDataGen>
  data.QuantumCatalyst = quantumCatalystData as WeaponDataGen
  return data
}
