import type { AscensionKey, CharacterKey } from '@genshin-optimizer/gi/consts'

export interface ICharacterTalent {
  auto: number
  skill: number
  burst: number
}

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: AscensionKey
  talent: ICharacterTalent
}

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['auto', 'skill', 'burst'] as const).includes(
    tKey as keyof ICharacter['talent'],
  )
}
