import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { AbilityKey, CharacterDataKey } from '@genshin-optimizer/sr/consts'
import {
  allAbilityKeys,
  allCharacterDataKeys,
  allTrailblazerGenderedKeys,
} from '@genshin-optimizer/sr/consts'
import type { AvatarSkillTreeConfig, Rank } from '@genshin-optimizer/sr/dm'
import {
  DmAttackTypeMap,
  avatarConfig,
  avatarRankConfig,
  avatarSkillConfig,
  avatarSkillTreeConfig,
  characterIdMap,
} from '@genshin-optimizer/sr/dm'
import { convertToHash } from '../util'

type CharData = {
  name: string
  abilities: AbilitiesData
  ranks: Ranks
}
type AbilitiesData = Partial<
  Record<
    AbilityKey | 'bonusAbility1' | 'bonusAbility2' | 'bonusAbility3',
    AbilityData[]
  >
>
type AbilityData = {
  name: string
  fullDesc: string
  shortDesc: string
  tag: string
}
type Ranks = Record<Rank, RankData>
type RankData = {
  name: string
  desc: string
}

function addBonusAbility(
  config: AvatarSkillTreeConfig,
  abilities: AbilitiesData,
  key: 'bonusAbility1' | 'bonusAbility2' | 'bonusAbility3'
) {
  abilities[key] = [
    {
      name: convertToHash(config.PointName).toString(),
      fullDesc: convertToHash(config.PointDesc).toString(),
      shortDesc: '',
      tag: '',
    },
  ]
}

const charArray = Object.entries(avatarConfig).map(([charId, charConfig]) => {
  const { AvatarName, SkillList } = charConfig
  const charKey = characterIdMap[charId]

  // Override for trailblazer
  const name = ([...allTrailblazerGenderedKeys] as string[]).includes(charKey)
    ? '-2090701432' // Trailblazer
    : AvatarName.Hash.toString()

  // Skills
  const abilities: AbilitiesData = Object.fromEntries(
    allAbilityKeys.map((key) => [key, []])
  )
  SkillList.forEach((skillId) => {
    const { SkillName, SkillDesc, SimpleSkillDesc, SkillTag, AttackType } =
      avatarSkillConfig[skillId][0]
    const ability =
      AttackType !== undefined ? DmAttackTypeMap[AttackType] : 'talent'
    abilities[ability]?.push({
      name: SkillName.Hash.toString(),
      fullDesc: SkillDesc.Hash.toString(),
      shortDesc: SimpleSkillDesc.Hash.toString(),
      tag: SkillTag.Hash.toString(),
    })
  })

  // Bonus abilities
  const [
    _basic,
    _skill,
    _ult,
    _talent,
    _technique,
    bonusAbility1,
    bonusAbility2,
    bonusAbility3,
  ] = Object.values(avatarSkillTreeConfig[charId]).map(
    // Grab the first level
    (skillTree) => skillTree[0]
  )
  addBonusAbility(bonusAbility1, abilities, 'bonusAbility1')
  addBonusAbility(bonusAbility2, abilities, 'bonusAbility2')
  addBonusAbility(bonusAbility3, abilities, 'bonusAbility3')

  // Eidolons
  const rankArray = Object.values(avatarRankConfig[charId]).map(
    (rankConfig) => {
      const { Rank, Name, Desc } = rankConfig
      const tuple: [Rank, RankData] = [
        Rank,
        {
          name: convertToHash(Name).toString(),
          desc: convertToHash(Desc).toString(),
        },
      ]
      return tuple
    }
  )
  const ranks = Object.fromEntries(rankArray)
  verifyObjKeys(ranks, ['1', '2', '3', '4', '5', '6'] as const)

  const tuple: [CharacterDataKey, CharData] = [
    charKey,
    {
      name,
      abilities,
      ranks,
    },
  ]
  return tuple
})

const data = Object.fromEntries(charArray)
verifyObjKeys(data, allCharacterDataKeys)
export const allCharHashData = data
