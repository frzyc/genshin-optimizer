import type {
  DamageTypeKey,
  NonTrailblazerCharacterKey,
  PathKey,
  RarityKey,
  StatKey,
} from '@genshin-optimizer/sr-consts'
import type { Anchor } from '@genshin-optimizer/sr-dm'
import {
  avatarBaseTypeMap,
  avatarConfig,
  avatarPromotionConfig,
  avatarRarityMap,
  avatarSkillConfig,
  avatarSkillTreeConfig,
  characterIdMap,
  statKeyMap,
} from '@genshin-optimizer/sr-dm'
import { transposeArray } from '@genshin-optimizer/util'

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
type SkillTree = {
  pointId: string
  anchor: Anchor
  levels?: SkillTreeNode[] | undefined
  skillParamList?: Array<number[]> | undefined
  pointType: number
}
type SkillTreeNode = {
  stats?: Partial<Record<StatKey, number>>
  //TODO: MaterialList
}
export type CharacterDataGen = {
  rarity: RarityKey
  damageType: DamageTypeKey
  path: PathKey
  ascension: Promotion[]
  skillTreeList: SkillTree[]
}

export type CharacterDatas = Record<
  NonTrailblazerCharacterKey,
  CharacterDataGen
>
export default function characterData() {
  const data = Object.fromEntries(
    Object.entries(avatarConfig).map(
      ([avatarid, { Rarity, DamageType, AvatarBaseType }]) => {
        const skillTreeList: SkillTree[] = Object.entries(
          avatarSkillTreeConfig[avatarid]
        ).map(([pointId, skillTree]) => {
          const { Anchor, PointType, LevelUpSkillID } = skillTree[0]
          const skillId = LevelUpSkillID[0]
          const skillParamList = skillId
            ? transposeArray(
                avatarSkillConfig[skillId]!.map(({ ParamList }) =>
                  ParamList.map(({ Value }) => Value)
                )
              )
            : undefined

          const levels = skillTree.map(({ StatusAddList }) => {
            if (!StatusAddList.length) return {}
            const stats = Object.fromEntries(
              StatusAddList.map(({ PropertyType, Value }) => {
                return [statKeyMap[PropertyType], Value.Value]
              })
            ) as Partial<Record<StatKey, number>>
            return { stats }
          })

          return {
            pointId,
            anchor: Anchor,
            levels: levels.every((l) => Object.keys(l).length === 0)
              ? undefined
              : levels,
            pointType: PointType,
            skillParamList,
          }
        })

        const result: CharacterDataGen = {
          rarity: avatarRarityMap[Rarity] as RarityKey,
          damageType: DamageType,
          path: avatarBaseTypeMap[AvatarBaseType],
          skillTreeList,
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
