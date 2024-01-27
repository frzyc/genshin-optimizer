import {
  allElementalDamageKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSubStatKeys,
  type RelicMainStatKey,
  type RelicRarityKey,
  type RelicSetKey,
  type RelicSubStatKey,
  type StatKey,
} from '@genshin-optimizer/sr-consts'
import {
  relicMainAffixConfigFlat,
  relicSetIdMap,
  relicSetSkillConfig_bySet,
  relicSubAffixConfig,
  statKeyMap,
} from '@genshin-optimizer/sr-dm'
import { objMap, verifyObjKeys } from '@genshin-optimizer/util'

type SubStat = {
  base: number //BaseValue
  step: number //StepValue
  numSteps: number //StepNum
}

type MainStat = {
  base: number //BaseValue
  add: number //LevelAdd
}

type SubStatMap = Record<RelicRarityKey, Record<RelicSubStatKey, SubStat>>
type MainStatMap = Record<
  RelicRarityKey,
  Partial<Record<RelicMainStatKey, MainStat>>
>

type SetEffect = {
  numRequired: number
  passiveStats: Partial<Record<StatKey, number>>
  otherStats: number[]
}

type RelicStatData = {
  main: MainStatMap
  sub: SubStatMap
}
export type RelicSetDatum = {
  setEffects: SetEffect[]
}
type RelicSetData = Record<RelicSetKey, RelicSetDatum>
type RelicData = RelicStatData & RelicSetData

export function RelicData(): RelicData {
  const sub = objMap(relicSubAffixConfig, (subsObj) =>
    Object.fromEntries(
      Object.values(subsObj).map(
        ({
          Property,
          BaseValue: { Value: base },
          StepValue: { Value: step },
          StepNum: numSteps,
        }) => [
          statKeyMap[Property],
          {
            base,
            step,
            numSteps,
          },
        ]
      )
    )
  )

  const relicMainAffixConfigFlatInValidRange = relicMainAffixConfigFlat.filter(
    ({ GroupID }) => GroupID < 100
  )
  const main = Object.fromEntries(
    allRelicRarityKeys.map((rarity) => [
      rarity,
      Object.fromEntries(
        relicMainAffixConfigFlatInValidRange
          .filter(({ GroupID }) => +GroupID.toString()[0] === rarity)
          .map(
            ({
              Property,
              BaseValue: { Value: base },
              LevelAdd: { Value: add },
            }) => [
              statKeyMap[Property],
              {
                base,
                add,
              },
            ]
          )
      ),
    ])
  )

  const relicSetData = Object.fromEntries(
    Object.entries(relicSetSkillConfig_bySet).map(([relicId, configs]) => [
      relicSetIdMap[relicId],
      {
        setEffects: configs.map(
          (config): SetEffect => ({
            numRequired: config.RequireNum,
            passiveStats: Object.fromEntries(
              // Expand all damage bonus to individual elemental dmg bonus
              config.PropertyList.flatMap((property) =>
                property.PBIJEBOGCKM === 'AllDamageTypeAddedRatio'
                  ? allElementalDamageKeys.map((key) => ({ ...property, key }))
                  : [{ ...property, key: statKeyMap[property.PBIJEBOGCKM] }]
              )
                // Map to desired object shape
                .map((property) => [property.key, property.AMMAAKPAKAA.Value])
            ),
            otherStats: config.AbilityParamList.map((param) => param.Value),
          })
        ),
      },
    ])
  )

  verifyObjKeys(relicSetData, allRelicSetKeys)

  verifyMainShape(main)

  verifySubShape(sub)

  const data = {
    sub,
    main,
    ...relicSetData,
  }

  return data
}

function verifyMainShape(
  main: Partial<MainStatMap>
): asserts main is MainStatMap {
  verifyObjKeys(
    main,
    allRelicRarityKeys.map((r) => r.toFixed())
  )
}

function verifySubShape(
  sub: Partial<
    Record<RelicRarityKey, Partial<Record<RelicSubStatKey, SubStat>>>
  >
): asserts sub is SubStatMap {
  Object.values(sub).forEach((raritySubs) =>
    verifyObjKeys(raritySubs, allRelicSubStatKeys)
  )

  const rarityKeys = allRelicRarityKeys.map((r) => r.toFixed())
  verifyObjKeys(sub, rarityKeys)
}
