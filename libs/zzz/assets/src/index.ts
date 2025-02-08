import type {
  CharacterKey,
  CharacterRarityKey,
  DiscSetKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import type { StaticImageData } from 'next/image'
import commonImages from './common'
import chars from './gen/chars'
import common from './gen/common'
import discs from './gen/discs'
import rarity from './gen/rarity'
import speciality from './gen/speciality'
type characterAssetKey = 'icon' | 'iconSelect' | 'iconGacha'
export type commonKey =
  | 'evade'
  | 'normal'
  | 'assist'
  | 'skill'
  | 'chain'
  | 'core'
type commonImagesKey = 'discBackdrop' | 'discDrive'
const characterAssetCache = new Map<string, string | StaticImageData>()

export function characterAsset(ck: CharacterKey, asset: characterAssetKey) {
  const cacheKey = `${ck}_${asset}`
  if (characterAssetCache.has(cacheKey))
    return characterAssetCache.get(cacheKey)!
  const result = chars[ck]
    ? (chars[ck] as Record<characterAssetKey, string | StaticImageData>)[asset]
    : ''
  characterAssetCache.set(cacheKey, result)
  return result
}

export function discDefIcon(setKey: DiscSetKey) {
  return setKey ? discs[setKey].circleIcon : ''
}

export function specialityDefIcon(profKey: SpecialityKey) {
  return profKey ? speciality[profKey] : ''
}

export function rarityDefIcon(rarityKey: CharacterRarityKey) {
  return rarityKey ? rarity[rarityKey] : ''
}

export function commonDefIcon(key: commonKey) {
  return key ? common[key] : ''
}

export function commonDefImages(key: commonImagesKey) {
  return key ? commonImages[key] : ''
}
