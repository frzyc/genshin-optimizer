import type {
  AdditiveReactionKey,
  AmplifyingReactionKey,
  ElementKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'

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
