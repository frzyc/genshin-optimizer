import {
  allElementalDamageKeys,
  type LightConeKey,
  type PathKey,
  type RarityKey,
  type StatKey,
} from '@genshin-optimizer/sr-consts'
import {
  avatarBaseTypeMap,
  equipmentConfig,
  equipmentPromotionConfig,
  equipmentSkillConfig,
  lightConeIdMap,
  lightConeRarityMap,
  statKeyMap,
} from '@genshin-optimizer/sr-dm'

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
  conditionalStats: number[]
  passiveStats: Partial<Record<StatKey, number>>
}

export type LightConeDataGen = {
  rarity: RarityKey
  path: PathKey
  ascension: Promotion[]
  superimpose: Superimpose[]
}

export type LightConeDatas = Record<LightConeKey, LightConeDataGen>
export default function LightConeData() {
  return Object.fromEntries(
    Object.entries(equipmentConfig).map(
      ([lightConeId, { Rarity, AvatarBaseType }]) => {
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
          superimpose: equipmentSkillConfig[lightConeId].map(
            ({ ParamList, AbilityProperty }) => ({
              conditionalStats: ParamList.map((p) => p.Value),
              passiveStats: Object.fromEntries(
                AbilityProperty.flatMap((ap) =>
                  // For AllDamageTypeAddedRatio, this adds dmg bonus to all elements individually
                  // So, we will just expand it here to make sheet creation easier.
                  ap.PropertyType === 'AllDamageTypeAddedRatio'
                    ? allElementalDamageKeys.map((key) => ({ ...ap, key }))
                    : [{ ...ap, key: statKeyMap[ap.PropertyType] }]
                ).map((ap) => [ap.key, ap.Value.Value])
              ),
            })
          ),
        }
        const lightConeKey = lightConeIdMap[lightConeId]
        return [lightConeKey, result] as const
      }
    )
  ) as LightConeDatas
}
