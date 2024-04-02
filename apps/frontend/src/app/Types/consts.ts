import type {
  AdditiveReactionKey,
  AmplifyingReactionKey,
  ElementKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'

export const allArtifactSetCount = [1, 2, 3, 4, 5] as const

export type SetNum = (typeof allArtifactSetCount)[number]

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
