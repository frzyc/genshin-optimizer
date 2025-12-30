import type { CharacterKey, MilestoneKey } from '@genshin-optimizer/zzz/consts'

interface ICharacterSkill {
  dodge: number
  basic: number
  chain: number
  special: number
  assist: number
}

export interface ICharacter extends ICharacterSkill {
  key: CharacterKey
  level: number
  core: number
  mindscape: number
  promotion: MilestoneKey
  potential: number
}
