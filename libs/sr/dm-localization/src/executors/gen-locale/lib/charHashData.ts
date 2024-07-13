import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { AbilityKey, CharacterDataKey } from '@genshin-optimizer/sr/consts'
import {
  allAbilityKeys,
  allCharacterDataKeys,
  allTrailblazerGenderedKeys,
} from '@genshin-optimizer/sr/consts'
import type { Rank } from '@genshin-optimizer/sr/dm'
import {
  DmAttackTypeMap,
  avatarConfig,
  avatarRankConfig,
  avatarSkillConfig,
  characterIdMap,
} from '@genshin-optimizer/sr/dm'
import { convertToHash } from './util'

type CharData = {
  name: string
  abilities: AbilitiesData
  ranks: Ranks
}
type AbilitiesData = Partial<Record<AbilityKey, AbilityData[]>>
type AbilityData = {
  name: string
  fullDesc: string
  shortDesc: string
}
type Ranks = Record<Rank, RankData>
type RankData = {
  name: string
  desc: string
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
    const { SkillName, SkillDesc, SimpleSkillDesc, AttackType } =
      avatarSkillConfig[skillId][0]
    const ability = DmAttackTypeMap[AttackType!]
    abilities[ability]?.push({
      name: SkillName.Hash.toString(),
      fullDesc: SkillDesc.Hash.toString(),
      shortDesc: SimpleSkillDesc.Hash.toString(),
    })
  })

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
export const charHashData = data
