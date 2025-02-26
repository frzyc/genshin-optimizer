import type {
  CondKey,
  DiscMainStatKey,
  DiscSetKey,
  DiscSlotKey,
  FormulaKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { ICharacter } from '@genshin-optimizer/zzz/zood'

export type Constraints = Record<string, { value: number; isMax: boolean }>
export type Stats = Record<string, number>

export interface ICharMeta {
  description: string
}

export interface IDbCharacter extends ICharacter {
  stats: Stats
  formulaKey: FormulaKey
  constraints: Constraints
  useEquipped: boolean
  setFilter2: DiscSetKey[]
  setFilter4: DiscSetKey[]
  slot4: DiscMainStatKey[]
  slot5: DiscMainStatKey[]
  slot6: DiscMainStatKey[]
  wengineKey: WengineKey
  wengineLvl: number
  wenginePhase: number
  conditionals: Partial<Record<CondKey, number>>
  levelLow: number
  levelHigh: number
}

export interface ICachedCharacter extends IDbCharacter {
  equippedDiscs: Record<DiscSlotKey, string>
  equippedWengine: string
}
