import {
  isIn,
  objKeyMap,
  range,
  transposeArray,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, TrailblazerKey } from '@genshin-optimizer/sr/consts'
import {
  type AbilityKey,
  type ElementalTypeKey,
  type PathKey,
  type RarityKey,
  type StatKey,
  allCharacterKeys,
  allTrailblazerGenderedKeys,
} from '@genshin-optimizer/sr/consts'
import type {
  Anchor,
  AvatarSkillTreeConfig,
  AvatarSkillTreeType,
  Rank,
  ServantSkillTreeType,
  SkillTreeType,
} from '@genshin-optimizer/sr/dm'
import {
  DmAttackTypeMap,
  allAvatarSkillTreeTypes,
  allRanks,
  allSkillTreeTypes,
  avatarBaseTypeMap,
  avatarConfig,
  avatarDamageTypeMap,
  avatarPromotionConfig,
  avatarRankConfig,
  avatarRarityMap,
  avatarServantSkillConfig,
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
  skillTree: Record<AvatarSkillTreeType, SkillTree>
  servantSkillTree?: Record<ServantSkillTreeType, SkillTree> | undefined
  rankMap: RankInfoMap
  maxEnergy: number
}

export type CharacterData = Record<CharacterKey, CharacterDatum>
export default function characterData(): CharacterData {
  const data = Object.fromEntries(
    Object.entries(avatarConfig).map(
      ([avatarid, { Rarity, DamageType, AvatarBaseType, SPNeed }]) => {
        const skillTree = Object.fromEntries(
          Object.entries(avatarSkillTreeConfig[avatarid]).map(
            ([pointId, skillTree], index) => {
              const { Anchor, PointType, LevelUpSkillID } = skillTree[0]
              const skillTreeType = allSkillTreeTypes[index]
              const skillParamList = getSkillParamList(
                LevelUpSkillID,
                skillTreeType,
                skillTree
              )

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
                skillTreeType,
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
        const servantSkillTree:
          | Record<ServantSkillTreeType, SkillTree>
          | undefined = skillTree['servantSkill']
          ? {
              servantSkill: skillTree['servantSkill'],
              servantTalent: skillTree['servantTalent'],
            }
          : undefined
        delete skillTree['servantSkill']
        delete skillTree['servantTalent']
        verifyObjKeys(skillTree, allAvatarSkillTreeTypes)

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
                  const skillConfig =
                    avatarSkillConfig[skillId] ??
                    avatarServantSkillConfig[skillId]
                  const attackType = skillConfig[0].AttackType
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
          servantSkillTree,
          ascension,
          rankMap,
          maxEnergy: SPNeed.Value,
        }
        const genderedKey = characterIdMap[avatarid]
        // Assumes genders have the same stats
        const charKey = isIn(allTrailblazerGenderedKeys, genderedKey)
          ? (genderedKey.slice(0, -1) as TrailblazerKey)
          : genderedKey
        return [charKey, result]
      }
    )
  )

  verifyObjKeys(data, allCharacterKeys)

  return data
}

function getSkillParamList(
  LevelUpSkillID: number[],
  skillTreeType: SkillTreeType,
  skillTree: AvatarSkillTreeConfig[]
): number[][][] {
  if (LevelUpSkillID.length > 0) {
    if (skillTree[0].PointType !== 4) {
      // Character skill (basic, skill, ult, talent, technique)
      return getSkillParamFromAvatarSkill(LevelUpSkillID, skillTreeType)
    } else {
      // Servant skill
      return getSkillParamFromAvatarServantSkill(LevelUpSkillID)
    }
  } else {
    // Grab from itself (AvatarSkillTreeConfig) (bonus abilities/stat boosts)
    return getSkillParamFromAvatarSkillTree(skillTree)
  }
}

function getSkillParamFromAvatarSkill(
  LevelUpSkillID: number[],
  skillTreeType: SkillTreeType
) {
  return LevelUpSkillID.map((skillId) =>
    // Add -1 at the beginning of arrays for basic, skill, ult, talent
    transposeArray([
      ...(skillTreeType === 'technique'
        ? []
        : [
            range(1, avatarSkillConfig[skillId][0].ParamList!.length).map(
              () => -1
            ),
          ]),
      ...avatarSkillConfig[skillId]!.map(({ ParamList }) =>
        ParamList.map(({ Value }) => Value)
      ),
    ])
  )
}

function getSkillParamFromAvatarSkillTree(skillTree: AvatarSkillTreeConfig[]) {
  return [
    skillTree.map((config) => [...config.ParamList.map(({ Value }) => Value)]),
  ]
}

function getSkillParamFromAvatarServantSkill(LevelUpSkillID: number[]) {
  return LevelUpSkillID.map((skillId) =>
    transposeArray([
      // Add in -1 for level 0
      range(1, avatarServantSkillConfig[skillId][0].ParamList.length).map(
        () => -1
      ),
      ...avatarServantSkillConfig[skillId].map(({ ParamList }) =>
        ParamList.map(({ Value }) => Value)
      ),
    ])
  )
}
