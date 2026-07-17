import { range, verifyObjKeys } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  type LightConeKey,
  type PathKey,
  type RarityKey,
} from '@genshin-optimizer/sr/consts'
import {
  avatarBaseTypeMap,
  equipmentConfig,
  equipmentPromotionConfig,
  equipmentSkillConfig_bySuperimpose,
  lightConeIdMap,
  lightConeRarityMap,
  statKeyMap,
} from '@genshin-optimizer/sr/dm'

type Promotion = {
  atk: Scaling
  def: Scaling
  hp: Scaling
}
type Scaling = {
  base: number
  add: number
}
type Superimpose = {
  otherStats: number[][]
  passiveStats: Partial<Record<StatKey, number[]>>
}

export type LightConeDatum = {
  rarity: RarityKey
  path: PathKey
  ascension: Promotion[]
  superimpose: Superimpose
}

export type LightConeData = Record<LightConeKey, LightConeDatum>
export default function LightConeData(): LightConeData {
  const data = Object.fromEntries(
    Object.entries(equipmentConfig).map(
      ([lightConeId, { Rarity, AvatarBaseType }]) => {
        const flatConfig = equipmentSkillConfig_bySuperimpose[lightConeId]
        const expandedConfig = {
          ...flatConfig,
          AbilityProperty: flatConfig.AbilityProperty.map((superimpose) =>
            superimpose.flatMap((abilityProperty) => [
              {
                ...abilityProperty,
                key: statKeyMap[abilityProperty.PropertyType],
              },
            ])
          ),
        }
        // Transpose the config so each param has its own array so we can use subscript() on it
        expandedConfig.ParamList = range(
          0,
          expandedConfig.ParamList[0].length - 1
        ).map((pIndex) =>
          expandedConfig.ParamList.map((params) => params[pIndex])
        )
        expandedConfig.AbilityProperty = range(
          0,
          expandedConfig.AbilityProperty[0].length - 1
        ).map((apIndex) =>
          expandedConfig.AbilityProperty.map((prop) => prop[apIndex])
        )

        const result: LightConeDatum = {
          rarity: lightConeRarityMap[Rarity],
          path: avatarBaseTypeMap[AvatarBaseType],
          ascension: equipmentPromotionConfig[lightConeId].map(
            ({
              BaseHP,
              BaseHPAdd,
              BaseAttack,
              BaseAttackAdd,
              BaseDefence,
              BaseDefenceAdd,
            }) => ({
              atk: {
                base: BaseAttack.Value,
                add: BaseAttackAdd.Value,
              },
              def: {
                base: BaseDefence.Value,
                add: BaseDefenceAdd.Value,
              },
              hp: {
                base: BaseHP.Value,
                add: BaseHPAdd.Value,
              },
            })
          ),
          superimpose: {
            otherStats: expandedConfig.ParamList.map((superimpose) => [
              -1,
              ...superimpose.map((param) => param.Value),
            ]),
            passiveStats: Object.fromEntries(
              expandedConfig.AbilityProperty.map((superimpose) => [
                superimpose[0].key,
                [-1, ...superimpose.map((prop) => prop.Value.Value)],
              ])
            ),
          },
        }
        const lightConeKey = lightConeIdMap[lightConeId]
        return [lightConeKey, result] as const
      }
    )
  )

  verifyObjKeys(data, allLightConeKeys)

  return data
}
