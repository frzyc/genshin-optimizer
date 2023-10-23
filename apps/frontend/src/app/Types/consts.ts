import type {
  AdditiveReactionKey,
  AmplifyingReactionKey,
  ElementKey,
  LocationCharacterKey,
} from '@genshin-optimizer/consts'
import { nonTravelerCharacterKeys } from '@genshin-optimizer/consts'

export const allArtifactSetCount = [1, 2, 3, 4, 5] as const

/**
 * @deprecated use `allRollColorKeys` in `@genshin-optimizer/gi-ui`
 */
export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const

export const travelerFKeys = [
  'TravelerAnemoF',
  'TravelerGeoF',
  'TravelerElectroF',
  'TravelerDendroF',
  'TravelerHydroF',
] as const
export const travelerMKeys = [
  'TravelerAnemoM',
  'TravelerGeoM',
  'TravelerElectroM',
  'TravelerDendroM',
  'TravelerHydroM',
] as const

export const allCharacterSheetKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerFKeys,
  ...travelerMKeys,
]
export type SetNum = (typeof allArtifactSetCount)[number]

export type CharacterSheetKey = (typeof allCharacterSheetKeys)[number]

/**
 * @deprecated use `RollColorKey` in `@genshin-optimizer/gi-ui`
 */
export type RollColorKey = (typeof allRollColorKeys)[number]

export const absorbableEle = [
  'hydro',
  'pyro',
  'cryo',
  'electro',
] as ElementKey[]
export const allowedAmpReactions: Dict<ElementKey, AmplifyingReactionKey[]> = {
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

export type LocationKey = LocationCharacterKey | ''
