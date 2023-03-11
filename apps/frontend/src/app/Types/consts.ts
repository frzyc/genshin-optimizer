import type {
  allArtifactSetKeys,
  WeaponBowKey,
  WeaponCatalystKey,
  WeaponClaymoreKey,
  WeaponPoleArmKey,
  WeaponSwordKey,
} from '@genshin-optimizer/consts'
import {
  allWeaponBowKeys,
  allWeaponCatalystKeys,
  allWeaponClaymoreKeys,
  allWeaponPolearmKeys,
  allWeaponSwordKeys,
  nonTravelerCharacterKeys,
} from '@genshin-optimizer/consts'

export const allHitModes = ['hit', 'avgHit', 'critHit'] as const
export const allAmpReactions = ['vaporize', 'melt'] as const
export const allAdditiveReactions = ['spread', 'aggravate'] as const
export const allArtifactSetCount = [1, 2, 3, 4, 5] as const

export const allArtifactRarities = [5, 4, 3] as const
/**
 * @deprecated
 */
export const allSlotKeys = [
  'flower',
  'plume',
  'sands',
  'goblet',
  'circlet',
] as const
/**
 * @deprecated
 */
export const allElements = [
  'anemo',
  'geo',
  'electro',
  'hydro',
  'pyro',
  'cryo',
  'dendro',
] as const
/**
 * @deprecated
 */
export const allElementsWithPhy = ['physical', ...allElements] as const
export const allInfusionAuraElements = ['pyro', 'cryo', 'hydro'] as const
/**
 * @deprecated
 */
export const allWeaponTypeKeys = [
  'sword',
  'claymore',
  'polearm',
  'bow',
  'catalyst',
] as const
export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const
/**
 * @deprecated
 */
export const allAscension = [0, 1, 2, 3, 4, 5, 6] as const
export const allRefinement = [1, 2, 3, 4, 5] as const
export const substatType = ['max', 'mid', 'min'] as const
export const genderKeys = ['F', 'M'] as const
export type Gender = (typeof genderKeys)[number]

/**
 * @deprecated
 */
export const allLocationCharacterKeys = [
  ...nonTravelerCharacterKeys,
  'Traveler',
] as const
export const travelerElements = ['anemo', 'geo', 'electro', 'dendro'] as const
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
/**
 * @deprecated
 */
export const travelerKeys = [
  'TravelerAnemo',
  'TravelerGeo',
  'TravelerElectro',
  'TravelerDendro',
] as const
/**
 * @deprecated
 */
export const allCharacterKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerKeys,
] as const

export const allCharacterSheetKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerFKeys,
  ...travelerMKeys,
]

/**
 * @deprecated
 */
export const allWeaponKeys = [
  ...allWeaponSwordKeys,
  ...allWeaponClaymoreKeys,
  ...allWeaponPolearmKeys,
  ...allWeaponBowKeys,
  ...allWeaponCatalystKeys,
] as const
/**
 * @deprecated
 */
export type WeaponKey =
  | WeaponSwordKey
  | WeaponClaymoreKey
  | WeaponPoleArmKey
  | WeaponBowKey
  | WeaponCatalystKey

export const characterSpecializedStatKeys = [
  'hp_',
  'atk_',
  'def_',
  'eleMas',
  'enerRech_',
  'heal_',
  'critRate_',
  'critDMG_',
  'physical_dmg_',
  'anemo_dmg_',
  'geo_dmg_',
  'electro_dmg_',
  'hydro_dmg_',
  'pyro_dmg_',
  'cryo_dmg_',
  'dendro_dmg_',
] as const

export type HitModeKey = (typeof allHitModes)[number]
export type AmpReactionKey = (typeof allAmpReactions)[number]
export type AdditiveReactionKey = (typeof allAdditiveReactions)[number]
export type SetNum = (typeof allArtifactSetCount)[number]
export type ArtifactRarity = (typeof allArtifactRarities)[number]
/**
 * @deprecated
 */
export type SlotKey = (typeof allSlotKeys)[number]
/**
 * @deprecated
 */
export type ElementKey = (typeof allElements)[number]
/**
 * @deprecated
 */
export type ElementKeyWithPhy = (typeof allElementsWithPhy)[number]
export type InfusionAuraElements = (typeof allInfusionAuraElements)[number]
/**
 * @deprecated
 */
export type ArtifactSetKey = (typeof allArtifactSetKeys)[number]
/**
 * @deprecated
 */
export type CharacterKey = (typeof allCharacterKeys)[number]
export type CharacterSheetKey = (typeof allCharacterSheetKeys)[number]
/**
 * @deprecated
 */
export type LocationCharacterKey = (typeof allLocationCharacterKeys)[number]
/**
 * @deprecated
 */
export type TravelerKey = (typeof travelerKeys)[number]
export type TravelerElementKey = (typeof travelerElements)[number]
/**
 * @deprecated
 */
export type WeaponTypeKey = (typeof allWeaponTypeKeys)[number]
export type RollColorKey = (typeof allRollColorKeys)[number]
/**
 * @deprecated
 */
export type Ascension = (typeof allAscension)[number]
export type Refinement = (typeof allRefinement)[number]
export type CharacterSpecializedStatKey =
  (typeof characterSpecializedStatKeys)[number]
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

/**
 * @deprecated
 */
export function charKeyToLocCharKey(
  charKey: CharacterKey
): LocationCharacterKey {
  if (travelerKeys.includes(charKey as TravelerKey)) return 'Traveler'
  return charKey as LocationCharacterKey
}

export function TravelerToElement(
  key: TravelerKey,
  element: TravelerElementKey
): TravelerKey {
  return ('Traveler' +
    element.toUpperCase().slice(0, 1) +
    element.slice(1)) as TravelerKey
}

/**
 * @deprecated
 */
export type LocationKey = LocationCharacterKey | ''

export function charKeyToCharName(ck: CharacterKey, gender: Gender): string {
  return ck.startsWith('Traveler') ? 'Traveler' + gender : ck
}
