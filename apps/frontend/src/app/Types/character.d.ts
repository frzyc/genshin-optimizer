import type { InputPremodKey } from '../Formula'
import type { EleEnemyResKey } from '../KeyMap'
import type { MainStatKey, SubstatKey } from './artifact'
import type {
  AdditiveReactionKey,
  AmpReactionKey,
  ArtifactRarity,
  ArtifactSetKey,
  Ascension,
  CharacterKey,
  HitModeKey,
  InfusionAuraElements,
  Refinement,
  SlotKey,
  SubstatType,
  WeaponKey,
} from './consts'
import type { IConditionalValues } from './sheet'

export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: HitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElements
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
}

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: Ascension
  talent: {
    auto: number
    skill: number
    burst: number
  }

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
  infusionAura: InfusionAuraElements | ''
  compareData: boolean
  customMultiTarget: CustomMultiTarget[]
  team: [
    teammate1: CharacterKey | '',
    teammate2: CharacterKey | '',
    teammate3: CharacterKey | ''
  ]
  teamConditional: Partial<Record<CharacterKey, IConditionalValues>>
}
export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: StrictDict<SlotKey, string>
  equippedWeapon: string
}

export type ICharTCArtifactSlot = {
  level: number
  statKey: MainStatKey
  rarity: ArtifactRarity
}
export type ICharTC = {
  weapon: {
    key: WeaponKey
    level: number
    ascension: Ascension
    refinement: Refinement
  }
  artifact: {
    slots: Record<SlotKey, ICharTCArtifactSlot>
    substats: {
      type: SubstatType
      stats: Record<SubstatKey, number>
    }
    sets: Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
  }
}
