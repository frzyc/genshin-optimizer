import type {
  CharacterKey,
  CharacterRarityKey,
  DiscSetKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import type { StaticImageData } from 'next/image'
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

export function characterAsset(ck: CharacterKey, asset: characterAssetKey) {
  return chars[ck]
    ? (chars[ck] as Record<characterAssetKey, string | StaticImageData>)[asset]
    : ''
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
