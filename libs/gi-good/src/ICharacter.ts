import type { AscensionKey, CharacterKey } from '@genshin-optimizer/consts'

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: AscensionKey
  talent: {
    auto: number
    skill: number
    burst: number
  }
}
