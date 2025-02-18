import type {
  AscensionKey,
  CharacterKey,
  CondKey,
  DiscMainStatKey,
  DiscSetKey,
  FormulaKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'

export type Constraints = Record<string, { value: number; isMax: boolean }>
export type Stats = Record<string, number>

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
  wengineKey: WengineKey
  wengineLvl: number
  wenginePhase: number
  stats: Stats
  formulaKey: FormulaKey
  constraints: Constraints
  useEquipped: boolean
  slot4: DiscMainStatKey[]
  slot5: DiscMainStatKey[]
  slot6: DiscMainStatKey[]
  levelLow: number
  levelHigh: number
  setFilter2: DiscSetKey[]
  setFilter4: DiscSetKey[]
  conditionals: Partial<Record<CondKey, number>>
  mindscape: number
  ascension: AscensionKey
  talent: ICharacterTalent
}

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['dodge', 'basic', 'chain', 'special', 'assist'] as const).includes(
    tKey as keyof ICharacter['talent']
  )
}
