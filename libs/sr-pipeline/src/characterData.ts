import type {
  DamageTypeKey,
  NonTrailblazerCharacterKey,
  PathKey,
  RarityKey,
} from '@genshin-optimizer/sr-consts'
import {
  avatarBaseTypeMap,
  avatarConfig,
  avatarPromotionConfig,
  avatarRarityMap,
  characterIdMap,
  lightConeRarityMap,
} from '@genshin-optimizer/sr-dm'

type Promotion = {
  atk: Scaling
  def: Scaling
  hp: Scaling
  spd: number
  crit_: number
  crit_dmg_: number
  taunt: number
}
type Scaling = {
  base: number
  add: number
}
export type CharacterDataGen = {
  rarity: RarityKey
  damageType: DamageTypeKey
  path: PathKey
  ascension: Promotion[]
}

export type CharacterDatas = Record<
  NonTrailblazerCharacterKey,
  CharacterDataGen
>
export default function characterData() {
  const data = Object.fromEntries(
    Object.entries(avatarConfig).map(
      ([avatarid, { Rarity, DamageType, AvatarBaseType }]) => {
        const result: CharacterDataGen = {
          rarity: avatarRarityMap[Rarity] as RarityKey,
          damageType: DamageType,
          path: avatarBaseTypeMap[AvatarBaseType],
          ascension: avatarPromotionConfig[avatarid].map(
            ({
              AttackAdd,
              AttackBase,
              DefenceBase,
              DefenceAdd,
              HPBase,
              HPAdd,
              SpeedBase,
              CriticalChance,
              CriticalDamage,
              BaseAggro,
            }) => ({
              atk: {
                base: AttackBase.Value,
                add: AttackAdd.Value,
              },
              def: {
                base: DefenceBase.Value,
                add: DefenceAdd.Value,
              },
              hp: {
                base: HPBase.Value,
                add: HPAdd.Value,
              },
              spd: SpeedBase.Value,
              crit_: CriticalChance.Value,
              crit_dmg_: CriticalDamage.Value,
              taunt: BaseAggro.Value,
            })
          ),
        }
        const charKey = characterIdMap[avatarid]
        return [charKey, result]
      }
    )
  ) as CharacterDatas
  return data
}
