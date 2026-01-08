import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
  MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'
import type { IConditionalValues } from '../Database/DataManagers/TeamCharacterDataManager'

export type BonusStats = Partial<Record<InputPremodKey, number>>
export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: BonusStats
  description: string
  conditionals: IConditionalValues
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
}
