import type { AssetDataType } from '@genshin-optimizer/zzz/assets-data'
import type {
  CharacterKey,
  CharacterRarityKey,
  DiscSetKey,
  SkillKey,
  SpecialityKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { StaticImageData } from 'next/image'
import commonImages from './common'
import rarity from './common/rarity'
import skill from './common/skill'
import speciality from './common/speciality'
import chars from './gen/chars'
import discs from './gen/discs'
import wengine from './gen/wengines'
type CommonImagesKey = 'discDrive'

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

export function commonDefIcon(key: SkillKey) {
  return key ? skill[key] : ''
}

export function commonDefImages(key: CommonImagesKey) {
  return key ? commonImages[key] : ''
}

export function wengineIcon(wKey: WengineKey) {
  return wKey ? wengine[wKey].icon : ''
}
