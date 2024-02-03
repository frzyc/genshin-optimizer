import {
  extrapolateFloat as exf,
  roundMantissa,
} from '@genshin-optimizer/common_pipeline'
import {
  objKeyMap,
  transposeArray,
  verifyObjKeys,
} from '@genshin-optimizer/common_util'
import type { CharacterDataKey } from '@genshin-optimizer/sr_consts'
import {
  allCharacterDataKeys,
  allEidolonKeys,
  type AbilityKey,
  type EidolonKey,
  type ElementalTypeKey,
  type PathKey,
  type RarityKey,
  type StatKey,
} from '@genshin-optimizer/sr_consts'
import type { Anchor } from '@genshin-optimizer/sr_dm'
import {
  DmAttackTypeMap,
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
} from '@genshin-optimizer/sr_dm'

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
  Record<Exclude<AbilityKey, 'technique' | 'overworld'>, number>
>
export type CharacterDatum = {
  rarity: RarityKey
  damageType: ElementalTypeKey
  path: PathKey
  ascension: Promotion[]
  skillTreeList: SkillTree[]
  rankMap: RankMap
}

function extrapolateFloat(val: number): number {
  const int = Math.floor(val)
  const frac = val - int
  if (frac != roundMantissa(frac, 32)) {
    console.warn(`Extrapolation error: unknown SR format for ${val}`)
    return val
  }
  // extrapolate as float
  return exf(val, { forced: true })
}

export type CharacterData = Record<CharacterDataKey, CharacterDatum>
export default function characterData(): CharacterData {
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
                  ParamList.map(({ Value }) => extrapolateFloat(Value))
                )
              )
            : undefined

          const levels = skillTree.map(({ StatusAddList }) => {
            if (!StatusAddList.length) return {}
            const stats = Object.fromEntries(
              StatusAddList.map(({ PropertyType, Value }) => {
                return [statKeyMap[PropertyType], extrapolateFloat(Value.Value)]
              })
            )
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
              base: extrapolateFloat(AttackBase.Value),
              add: extrapolateFloat(AttackAdd.Value),
            },
            def: {
              base: extrapolateFloat(DefenceBase.Value),
              add: extrapolateFloat(DefenceAdd.Value),
            },
            hp: {
              base: extrapolateFloat(HPBase.Value),
              add: extrapolateFloat(HPAdd.Value),
            },
            spd: extrapolateFloat(SpeedBase.Value),
            crit_: extrapolateFloat(CriticalChance.Value),
            crit_dmg_: extrapolateFloat(CriticalDamage.Value),
            taunt: extrapolateFloat(BaseAggro.Value),
          })
        )

        const rankMap = objKeyMap(allEidolonKeys, (eidolon): Rank => {
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
            params: rankConfig.Param.map((p) => extrapolateFloat(p.Value)),
          }
        })

        const result: CharacterDatum = {
          rarity: avatarRarityMap[Rarity] as RarityKey,
          damageType: avatarDamageTypeMap[DamageType],
          path: avatarBaseTypeMap[AvatarBaseType],
          skillTreeList,
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
