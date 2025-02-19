import type { AscensionKey, CharacterKey } from '@genshin-optimizer/zzz/consts'

export interface ICharacterTalent {
  dodge: number
  basic: number
  chain: number
  special: number
  assist: number
}

export interface ICharacter {
  key: CharacterKey
  level: number
  core: number
  mindscape: number
  ascension: AscensionKey
  talent: ICharacterTalent
}

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['dodge', 'basic', 'chain', 'special', 'assist'] as const).includes(
    tKey as keyof ICharacter['talent']
  )
}
