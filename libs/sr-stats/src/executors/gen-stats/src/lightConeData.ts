import { extrapolateFloat } from '@genshin-optimizer/pipeline'
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
  otherStats: number[][]
  passiveStats: Partial<Record<StatKey, number[]>>
}

export type LightConeDataGen = {
  rarity: RarityKey
  path: PathKey
  ascension: Promotion[]
  superimpose: Superimpose
}

export type LightConeDatas = Record<LightConeKey, LightConeDataGen>
export default function LightConeData(): LightConeDatas {
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
                base: extrapolateFloat(BaseAttack.Value),
                add: extrapolateFloat(BaseAttackAdd.Value),
              },
              def: {
                base: extrapolateFloat(BaseDefence.Value),
                add: extrapolateFloat(BaseDefenceAdd.Value),
              },
              hp: {
                base: extrapolateFloat(BaseHP.Value),
                add: extrapolateFloat(BaseHPAdd.Value),
              },
            })
          ),
          superimpose: {
            otherStats: expandedConfig.ParamList.map((superimpose) =>
              superimpose.map((param) => extrapolateFloat(param.Value))
            ),
            passiveStats: Object.fromEntries(
              expandedConfig.AbilityProperty.map((superimpose) => [
                superimpose[0].key,
                superimpose.map((prop) => extrapolateFloat(prop.Value.Value)),
              ])
            ),
          },
        }
        const lightConeKey = lightConeIdMap[lightConeId]
        return [lightConeKey, result] as const
      }
    )
  )
}
