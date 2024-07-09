import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { AbilityKey, CharacterDataKey } from '@genshin-optimizer/sr/consts'
import {
  allAbilityKeys,
  allCharacterDataKeys,
  allTrailblazerGenderedKeys,
} from '@genshin-optimizer/sr/consts'
import {
  DmAttackTypeMap,
  avatarConfig,
  avatarSkillConfig,
  characterIdMap,
} from '@genshin-optimizer/sr/dm'

type CharData = {
  name: string
  abilities: AbilitiesData
}
type AbilitiesData = Partial<Record<AbilityKey, AbilityData[]>>
type AbilityData = {
  name: string
  fullDesc: string
  shortDesc: string
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

  const tuple: [CharacterDataKey, CharData] = [
    charKey,
    {
      name,
      abilities,
    },
  ]
  return tuple
})

const data = Object.fromEntries(charArray)
verifyObjKeys(data, allCharacterDataKeys)
export const charHashData = data
