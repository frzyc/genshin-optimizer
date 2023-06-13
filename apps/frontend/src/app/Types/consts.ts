import type {
  ElementKey,
  LocationCharacterKey,
} from '@genshin-optimizer/consts'
import { nonTravelerCharacterKeys } from '@genshin-optimizer/consts'

export const allHitModes = ['hit', 'avgHit', 'critHit'] as const
export const allAmpReactions = ['vaporize', 'melt'] as const
export const allAdditiveReactions = ['spread', 'aggravate'] as const
export const allArtifactSetCount = [1, 2, 3, 4, 5] as const

export const allArtifactRarities = [5, 4, 3] as const

export const allInfusionAuraElements = [
  'pyro',
  'cryo',
  'hydro',
  'electro',
] as const

export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const
export const allRefinement = [1, 2, 3, 4, 5] as const
export const substatType = ['max', 'mid', 'min'] as const

export const travelerFKeys = [
  'TravelerAnemoF',
  'TravelerGeoF',
  'TravelerElectroF',
  'TravelerDendroF',
] as const
export const travelerMKeys = [
  'TravelerAnemoM',
  'TravelerGeoM',
  'TravelerElectroM',
  'TravelerDendroM',
] as const

export const allCharacterSheetKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerFKeys,
  ...travelerMKeys,
]
export type HitModeKey = (typeof allHitModes)[number]
export type AmpReactionKey = (typeof allAmpReactions)[number]
export type AdditiveReactionKey = (typeof allAdditiveReactions)[number]
export type SetNum = (typeof allArtifactSetCount)[number]
export type ArtifactRarity = (typeof allArtifactRarities)[number]
export type InfusionAuraElements = (typeof allInfusionAuraElements)[number]

export type CharacterSheetKey = (typeof allCharacterSheetKeys)[number]

export type RollColorKey = (typeof allRollColorKeys)[number]

export type Refinement = (typeof allRefinement)[number]

export const absorbableEle = [
  'hydro',
  'pyro',
  'cryo',
  'electro',
] as ElementKey[]
export const allowedAmpReactions: Dict<ElementKey, AmpReactionKey[]> = {
  pyro: ['vaporize', 'melt'],
  hydro: ['vaporize'],
  cryo: ['melt'],
  anemo: ['vaporize', 'melt'],
}
export const allowedAdditiveReactions: Dict<ElementKey, AdditiveReactionKey[]> =
  {
    dendro: ['spread'],
    electro: ['aggravate'],
    anemo: ['aggravate'],
  }

export type SubstatType = (typeof substatType)[number]

export type LocationKey = LocationCharacterKey | ''
