import {
  objKeyMap,
  transposeArray,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import type { CharacterDataKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterDataKeys,
  type AbilityKey,
  type ElementalTypeKey,
  type PathKey,
  type RarityKey,
  type StatKey,
} from '@genshin-optimizer/sr/consts'
import type { Anchor, Rank, SkillTreeType } from '@genshin-optimizer/sr/dm'
import {
  DmAttackTypeMap,
  allRanks,
  allSkillTreeTypes,
  avatarBaseTypeMap,
  avatarConfig,
  avatarDamageTypeMap,
  avatarPromotionConfig,
  avatarRankConfig,
  avatarRarityMap,
  avatarSkillConfig,
  avatarSkillTreeConfig,
  characterIdMap,
  statKeyMap,
} from '@genshin-optimizer/sr/dm'

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
  skillParamList: number[][][]
  pointType: number
}
type SkillTreeNode = {
  stats?: SkillTreeNodeBonusStat
  //TODO: MaterialList
}
export type SkillTreeNodeBonusStat = Partial<Record<StatKey, number>>
type RankInfoMap = Record<Rank, RankInfo>
type RankInfo = {
  skillTypeAddLevel: SkillTypeAddLevel
  params: number[]
}
type SkillTypeAddLevel = Partial<
  Record<Exclude<AbilityKey, 'technique' | 'overworld'>, number>
>
export type CharacterDatum = {
  rarity: RarityKey
  damageType: ElementalTypeKey
  path: PathKey
  ascension: Promotion[]
  skillTree: Record<SkillTreeType, SkillTree>
  rankMap: RankInfoMap
}

export type CharacterData = Record<CharacterDataKey, CharacterDatum>
export default function characterData(): CharacterData {
  const data = Object.fromEntries(
    Object.entries(avatarConfig).map(
      ([avatarid, { Rarity, DamageType, AvatarBaseType }]) => {
        const skillTree = Object.fromEntries(
          Object.entries(avatarSkillTreeConfig[avatarid]).map(
            ([pointId, skillTree], index) => {
              const { Anchor, PointType, LevelUpSkillID } = skillTree[0]
              const skillParamList =
                LevelUpSkillID.length > 0
                  ? // Grab from AvatarSkillConfig (non-traces)
                    LevelUpSkillID.map((skillId) =>
                      transposeArray(
                        avatarSkillConfig[skillId]!.map(({ ParamList }) =>
                          ParamList.map(({ Value }) => Value)
                        )
                      )
                    )
                  : // Grab from itself (AvatarSkillTreeConfig) (traces)
                    [
                      skillTree.map((config) =>
                        config.ParamList.map(({ Value }) => Value)
                      ),
                    ]

              const levels = skillTree.map(({ StatusAddList }) => {
                if (!StatusAddList.length) return {}
                const stats = Object.fromEntries(
                  StatusAddList.map(({ PropertyType, Value }) => {
                    return [statKeyMap[PropertyType], Value.Value]
                  })
                )
                return { stats }
              })

              const tuple: [SkillTreeType, SkillTree] = [
                allSkillTreeTypes[index],
                {
                  pointId,
                  anchor: Anchor,
                  levels: levels.every((l) => Object.keys(l).length === 0)
                    ? undefined
                    : levels,
                  pointType: PointType,
                  skillParamList,
                },
              ]
              return tuple
            }
          )
        )
        verifyObjKeys(skillTree, allSkillTreeTypes)

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

        const rankMap = objKeyMap(allRanks, (eidolon): RankInfo => {
          const rankConfig = avatarRankConfig[avatarid][eidolon]
          return {
            skillTypeAddLevel: Object.fromEntries(
              Object.entries(rankConfig.SkillAddLevelList).map(
                ([skillId, levelBoost]) => {
                  const attackType = avatarSkillConfig[skillId][0].AttackType
                  return [
                    // AttackType fallback to Talent if not defined
                    attackType ? DmAttackTypeMap[attackType] : 'talent',
                    levelBoost,
                  ]
                }
              )
            ),
            params: rankConfig.Param.map((p) => p.Value),
          }
        })

        const result: CharacterDatum = {
          rarity: avatarRarityMap[Rarity] as RarityKey,
          damageType: avatarDamageTypeMap[DamageType],
          path: avatarBaseTypeMap[AvatarBaseType],
          skillTree,
          ascension,
          rankMap,
        }
        const charKey = characterIdMap[avatarid]
        return [charKey, result]
      }
    )
  )

  verifyObjKeys(data, allCharacterDataKeys)

  return data
}
