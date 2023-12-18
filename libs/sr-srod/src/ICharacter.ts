import type {
  AscensionKey,
  BonusAbilityKey,
  CharacterKey,
  StatBoostKey,
} from '@genshin-optimizer/sr-consts'

export interface ICharacter {
  key: CharacterKey
  level: number
  eidolon: number
  ascension: AscensionKey
  basic: number
  skill: number
  ult: number
  talent: number
  bonusAbilities: Partial<Record<BonusAbilityKey, boolean>>
  statBoosts: Partial<Record<StatBoostKey, boolean>>
}
