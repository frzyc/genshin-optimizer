import type { StaticImageData } from 'next/image'

import type { TravelerKey } from '@genshin-optimizer/gi/consts'
import {
  allTravelerKeys,
  type CharacterKey,
  type GenderKey,
  type LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { portrait } from '@genshin-optimizer/gi/silly-wisher'

export function iconAsset(
  cKey: CharacterKey,
  gender: GenderKey,
  silly: boolean
) {
  const sillyAsset = portrait(cKey, gender)
  const genshinAsset = characterAsset(cKey, 'icon', gender)
  if (silly && sillyAsset) return sillyAsset
  return genshinAsset || ''
}

export function assetWrapper(src: unknown) {
  if (typeof src === 'string') return { src } as StaticImageData
  else return src as StaticImageData
}

export function locationCharacterKeyToCharacterKey(
  key: LocationCharacterKey,
  characters: ICharacter[]
): CharacterKey {
  return key === 'Traveler' ? getTravelerCharacterKey(characters) : key
}

export function getTravelerCharacterKey(
  characters: ICharacter[]
): CharacterKey {
  // Get the first traveler characterKey in this set, if not, return a default
  return (
    characters.find(({ key }) => allTravelerKeys.includes(key as TravelerKey))
      ?.key ?? allTravelerKeys[0]
  )
}
