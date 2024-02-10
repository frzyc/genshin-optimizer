import {
  type AdditiveReactionKey,
  type AmpReactionKey,
  type ArtifactSetKey,
  type CharacterKey,
  type HitModeKey,
  type InfusionAuraElementKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import type { InputPremodKey } from '../legacy/keys'
import type { CustomMultiTarget } from './CustomMultiTarget'

type CondKey = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<
  Record<CondKey, { [key: string]: string }>
>

export interface IGOCharacter extends ICharacter {
  // GO-specific
  hitMode: HitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  conditional: IConditionalValues
  bonusStats: Partial<Record<InputPremodKey, number>>
  enemyOverride: Partial<
    Record<
      EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
      number
    >
  >
  infusionAura: InfusionAuraElementKey | ''
  compareData: boolean
  customMultiTarget: CustomMultiTarget[]
  team: [
    teammate1: CharacterKey | '',
    teammate2: CharacterKey | '',
    teammate3: CharacterKey | ''
  ]
  teamConditional: Partial<Record<CharacterKey, IConditionalValues>>
}
