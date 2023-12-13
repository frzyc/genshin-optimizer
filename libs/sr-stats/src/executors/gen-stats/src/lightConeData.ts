import type {
  LightConeKey,
  PathKey,
  RarityKey,
} from '@genshin-optimizer/sr-consts'
import {
  avatarBaseTypeMap,
  equipmentConfig,
  equipmentPromotionConfig,
  lightConeIdMap,
  lightConeRarityMap,
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

export type LightConeDataGen = {
  rarity: RarityKey
  path: PathKey
  ascension: Promotion[]
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
        }
        const lightConeKey = lightConeIdMap[lightConeId]
        return [lightConeKey, result] as const
      }
    )
  ) as LightConeDatas
}
