import type {
  AdditiveReactionKey,
  AmpReactionKey,
  ArtifactRarity,
  ArtifactSlotKey,
  AscensionKey,
  CharacterKey,
  HitModeKey,
  InfusionAuraElementKey,
  MainStatKey,
  MultiOptHitModeKey,
  RefinementKey,
  SubstatKey,
  SubstatTypeKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { InputPremodKey } from '../Formula'
import type { EleEnemyResKey } from '../KeyMap'
import type { IConditionalValues } from './sheet'
export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
}

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
export interface ICachedCharacter extends IGOCharacter {
  equippedArtifacts: StrictDict<ArtifactSlotKey, string>
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
    ascension: AscensionKey
    refinement: RefinementKey
  }
  artifact: {
    slots: Record<ArtifactSlotKey, ICharTCArtifactSlot>
    substats: {
      type: SubstatTypeKey
      stats: Record<SubstatKey, number>
      rarity: ArtifactRarity
    }
    sets: Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
  }
  optimization: {
    target?: string[]
    distributedSubstats: number
    maxSubstats: Record<SubstatKey, number>
    /** NB: this is in total raw value, not substat count
     * This includes stats from other sources
     * e.g. `{enerRech_: 0.3}`
     */
    minTotal: Partial<
      Record<Exclude<SubstatKey, 'hp_' | 'atk_' | 'def_'>, number>
    >
  }
}
