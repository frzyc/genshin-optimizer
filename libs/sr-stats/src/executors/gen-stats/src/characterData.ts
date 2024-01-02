import {
  allEidolonKeys,
  type AbilityKey,
  type EidolonKey,
  type NonTrailblazerCharacterKey,
  type PathKey,
  type RarityKey,
  type StatKey,
  type TypeKey,
} from '@genshin-optimizer/sr-consts'
import type { Anchor } from '@genshin-optimizer/sr-dm'
import {
  DmAttackTypeMap,
  avatarBaseTypeMap,
  avatarConfig,
  avatarPromotionConfig,
  avatarRankConfig,
  avatarRarityMap,
  avatarSkillConfig,
  avatarSkillTreeConfig,
  characterIdMap,
  statKeyMap,
} from '@genshin-optimizer/sr-dm'
import { objKeyMap, transposeArray } from '@genshin-optimizer/util'

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
  stats?: SkillTreeNodeBonusStat
  //TODO: MaterialList
}
export type SkillTreeNodeBonusStat = Partial<Record<StatKey, number>>
type RankMap = Record<EidolonKey, Rank>
type Rank = {
  skillTypeAddLevel: SkillTypeAddLevel
  params: number[]
}
type SkillTypeAddLevel = Partial<
  Record<Exclude<AbilityKey, 'technique'>, number>
>
export type CharacterDataGen = {
  rarity: RarityKey
  damageType: TypeKey
  path: PathKey
  ascension: Promotion[]
  skillTreeList: SkillTree[]
  rankMap: RankMap
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

        const ascension = avatarPromotionConfig[avatarid].map(
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
        )

        const rankMap = objKeyMap(allEidolonKeys, (eidolon): Rank => {
          const rankConfig = avatarRankConfig[avatarid][eidolon]
          return {
            skillTypeAddLevel: Object.fromEntries(
              Object.entries(rankConfig.SkillAddLevelList).map(
                ([skillId, levelBoost]) => [
                  // AttackType is always defined on the skills that get buffed by eidolons
                  DmAttackTypeMap[avatarSkillConfig[skillId][0].AttackType!],
                  levelBoost,
                ]
              )
            ) as SkillTypeAddLevel,
            params: rankConfig.Param.map((p) => p.Value),
          }
        })

        const result: CharacterDataGen = {
          rarity: avatarRarityMap[Rarity] as RarityKey,
          damageType: DamageType,
          path: avatarBaseTypeMap[AvatarBaseType],
          skillTreeList,
          ascension,
          rankMap,
        }
        const charKey = characterIdMap[avatarid]
        return [charKey, result]
      }
    )
  ) as CharacterDatas
  return data
}
