import type { AssetDataType } from '@genshin-optimizer/zzz/assets-data'
import type {
  CharacterKey,
  CharacterRarityKey,
  DiscSetKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import type { StaticImageData } from 'next/image'
import commonImages from './common'
import rarity from './common/rarity'
import common from './common/skill'
import speciality from './common/speciality'
import chars from './gen/chars'
import discs from './gen/discs'
export type commonKey =
  | 'evade'
  | 'normal'
  | 'assist'
  | 'skill'
  | 'chain'
  | 'core'
type commonImagesKey = 'discBackdrop' | 'discDrive'

export function characterAsset(
  ck: CharacterKey,
  asset: keyof AssetDataType['chars'][CharacterKey]
) {
  return (chars[ck]?.[asset] ?? '') as string | StaticImageData
}

export function discDefIcon(setKey: DiscSetKey) {
  return setKey ? discs[setKey].circle : ''
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
