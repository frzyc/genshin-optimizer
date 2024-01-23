import type { StatKey } from '@genshin-optimizer/sr-consts'
import {
  allElementalDamageKeys,
  type LightConeKey,
  type PathKey,
  type RarityKey,
} from '@genshin-optimizer/sr-consts'
import {
  avatarBaseTypeMap,
  equipmentConfig,
  equipmentPromotionConfig,
  equipmentSkillConfig_bySuperimpose,
  lightConeIdMap,
  lightConeRarityMap,
  statKeyMap,
} from '@genshin-optimizer/sr-dm'
import { range } from '@genshin-optimizer/util'

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
  conditionalStats: number[][]
  passiveStats: Partial<Record<StatKey, number[]>>
}

export type LightConeDataGen = {
  rarity: RarityKey
  path: PathKey
  ascension: Promotion[]
  superimpose: Superimpose
}

export type LightConeDatas = Record<LightConeKey, LightConeDataGen>
export default function LightConeData() {
  return Object.fromEntries(
    Object.entries(equipmentConfig).map(
      ([lightConeId, { Rarity, AvatarBaseType }]) => {
        const flatConfig = equipmentSkillConfig_bySuperimpose[lightConeId]
        // Expand AllDamageTypeAddedRatio to all elemental dmg bonus
        const expandedConfig = {
          ...flatConfig,
          AbilityProperty: flatConfig.AbilityProperty.map((superimpose) =>
            superimpose.flatMap((abilityProperty) =>
              abilityProperty.PropertyType === 'AllDamageTypeAddedRatio'
                ? allElementalDamageKeys.map((key) => ({
                    ...abilityProperty,
                    key,
                  }))
                : [
                    {
                      ...abilityProperty,
                      key: statKeyMap[abilityProperty.PropertyType],
                    },
                  ]
            )
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

        const result: LightConeDataGen = {
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
            conditionalStats: expandedConfig.ParamList.map((superimpose) =>
              superimpose.map((param) => param.Value)
            ),
            passiveStats: Object.fromEntries(
              expandedConfig.AbilityProperty.map((superimpose) => [
                superimpose[0].key,
                superimpose.map((prop) => prop.Value.Value),
              ])
            ),
          },
        }
        const lightConeKey = lightConeIdMap[lightConeId]
        return [lightConeKey, result] as const
      }
    )
  ) as LightConeDatas
}
