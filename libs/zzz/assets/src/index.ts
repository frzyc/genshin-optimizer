import type { AssetDataType } from '@genshin-optimizer/zzz/assets-data'
import type {
  CharacterKey,
  DiscSetKey,
  FactionKey,
  Raritykey,
  SkillKey,
  SpecialityKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { StaticImageData } from 'next/image'
import commonImages from './common'
import faction from './common/faction'
import phases from './common/phases'
import rarity from './common/rarity'
import skill from './common/skill'
import speciality from './common/speciality'
import chars from './gen/chars'
import discs from './gen/discs'
import wengines from './gen/wengines'

type CommonImagesKey = 'discDrive'
export type WenginePhaseKey =
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5'
  | 'singlePhase'
  | 'singleNonPhase'

export function characterAsset(
  ck: CharacterKey,
  asset: keyof AssetDataType['chars'][CharacterKey]
) {
  return (chars[ck]?.[asset] ?? '') as string | StaticImageData
}

export function wengineAsset(
  wk: WengineKey,
  asset: keyof AssetDataType['wengines'][WengineKey]
) {
  return (wengines[wk]?.[asset] ?? '') as string | StaticImageData
}

export function wenginePhaseIcon(pk: WenginePhaseKey) {
  return pk ? phases[pk] : ''
}

export function discDefIcon(setKey: DiscSetKey) {
  return setKey ? discs[setKey].circle : ''
}

export function specialityDefIcon(profKey: SpecialityKey) {
  return profKey ? speciality[profKey] : ''
}

export function rarityDefIcon(rarityKey: Raritykey) {
  return rarityKey ? rarity[rarityKey] : ''
}

export function factionDefIcon(factionKey: FactionKey) {
  return factionKey ? faction[factionKey] : ''
}

export function commonDefIcon(key: SkillKey | 'core') {
  return key ? skill[key] : ''
}

export function commonDefImages(key: CommonImagesKey) {
  return key ? commonImages[key] : ''
}
