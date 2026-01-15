import {
  type AscensionKey,
  ascensionMaxLevel,
  validateLevelAsc,
} from './common'
import type { AdditiveReactionKey } from './go'
import type { AmplifyingReactionKey } from './reaction'

export const allGenderKeys = ['F', 'M'] as const
export type GenderKey = (typeof allGenderKeys)[number]

export const allElementKeys = [
  'anemo',
  'geo',
  'electro',
  'hydro',
  'pyro',
  'cryo',
  'dendro',
] as const
export type ElementKey = (typeof allElementKeys)[number]

export const allElementWithPhyKeys = ['physical', ...allElementKeys] as const
export type ElementWithPhyKey = (typeof allElementWithPhyKeys)[number]

export const allRegionKeys = [
  'mondstadt',
  'liyue',
  'inazuma',
  'sumeru',
  'fontaine',
  'natlan',
  'snezhnaya',
  'khaenriah',
  'nodKrai',
] as const
export type RegionKey = (typeof allRegionKeys)[number]

export const allMoveKeys = [
  'normal',
  'charged',
  'plunging',
  'skill',
  'burst',
  'elemental',
] as const
export type MoveKey = (typeof allMoveKeys)[number]

export const maxConstellationCount = 6 as const

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
export type CharacterSpecializedStatKey =
  (typeof characterSpecializedStatKeys)[number]

export const allCharacterSkillKeys = [
  'auto',
  'skill',
  'burst',
  'sprint',
  'passive',
  'passive1',
  'passive2',
  'passive3',
  'lockedPassive',
  'constellation1',
  'constellation2',
  'constellation3',
  'constellation4',
  'constellation5',
  'constellation6',
] as const
export type CharacterSkillKey = (typeof allCharacterSkillKeys)[number]

export const nonTravelerCharacterKeys = [
  'Aino',
  'Albedo',
  'Alhaitham',
  'Aloy',
  'Amber',
  'AratakiItto',
  'Arlecchino',
  'Baizhu',
  'Barbara',
  'Beidou',
  'Bennett',
  'Candace',
  'Charlotte',
  'Chasca',
  'Chevreuse',
  'Chiori',
  'Chongyun',
  'Citlali',
  'Clorinde',
  'Collei',
  'Columbina',
  'Cyno',
  'Dahlia',
  'Dehya',
  'Diluc',
  'Diona',
  'Dori',
  'Durin',
  'Emilie',
  'Escoffier',
  'Eula',
  'Faruzan',
  'Fischl',
  'Flins',
  'Freminet',
  'Furina',
  'Gaming',
  'Ganyu',
  'Gorou',
  'HuTao',
  'Iansan',
  'Ifa',
  'Ineffa',
  'Jahoda',
  'Jean',
  'Kachina',
  'KaedeharaKazuha',
  'Kaeya',
  'KamisatoAyaka',
  'KamisatoAyato',
  'Kaveh',
  'Keqing',
  'Kinich',
  'Kirara',
  'Klee',
  'KujouSara',
  'KukiShinobu',
  'LanYan',
  'Lauma',
  'Layla',
  'Lisa',
  'Lynette',
  'Lyney',
  'Mavuika',
  'Mika',
  'Mona',
  'Mualani',
  'Nahida',
  'Navia',
  'Nefer',
  'Neuvillette',
  'Nilou',
  'Ningguang',
  'Noelle',
  'Ororon',
  'Qiqi',
  'RaidenShogun',
  'Razor',
  'Rosaria',
  'SangonomiyaKokomi',
  'Sayu',
  'Sethos',
  'Shenhe',
  'ShikanoinHeizou',
  'Sigewinne',
  'Skirk',
  'Somnia',
  'Sucrose',
  'Tartaglia',
  'Thoma',
  'Tighnari',
  'Varesa',
  'Venti',
  'Wanderer',
  'Wriothesley',
  'Xiangling',
  'Xianyun',
  'Xiao',
  'Xilonen',
  'Xingqiu',
  'Xinyan',
  'YaeMiko',
  'Yanfei',
  'Yaoyao',
  'Yelan',
  'Yoimiya',
  'YumemizukiMizuki',
  'YunJin',
  'Zhongli',
] as const
export type NonTravelerCharacterKey = (typeof nonTravelerCharacterKeys)[number]

export const travelerElements = [
  'anemo',
  'geo',
  'electro',
  'dendro',
  'hydro',
  'pyro',
] as const
export type TravelerElementKey = (typeof travelerElements)[number]

export const allTravelerKeys = [
  'TravelerAnemo',
  'TravelerGeo',
  'TravelerElectro',
  'TravelerDendro',
  'TravelerHydro',
  'TravelerPyro',
] as const
export type TravelerKey = (typeof allTravelerKeys)[number]

export const travelerEleMap: Partial<Record<ElementKey, TravelerKey>> = {
  anemo: 'TravelerAnemo',
  geo: 'TravelerGeo',
  electro: 'TravelerElectro',
  dendro: 'TravelerDendro',
  hydro: 'TravelerHydro',
  pyro: 'TravelerPyro',
} as const

export const locationGenderedCharacterKeys = [
  ...nonTravelerCharacterKeys,
  'TravelerF',
  'TravelerM',
] as const
export type LocationGenderedCharacterKey =
  (typeof locationGenderedCharacterKeys)[number]

export const allCharacterKeys = [
  ...nonTravelerCharacterKeys,
  ...allTravelerKeys,
] as const
export type CharacterKey = (typeof allCharacterKeys)[number]
export function isCharacterKey(key: string): key is CharacterKey {
  return allCharacterKeys.includes(key as CharacterKey)
}

export const allLocationCharacterKeys = [
  ...nonTravelerCharacterKeys,
  'Traveler',
] as const
export type LocationCharacterKey = (typeof allLocationCharacterKeys)[number]

export type LocationKey = LocationCharacterKey | ''

// Genshin Impact currently only has 4-5 star characters
export const allCharacterRarityKeys = [5, 4] as const
export type CharacterRarityKey = (typeof allCharacterRarityKeys)[number]

export function charKeyToLocGenderedCharKey(
  charKey: CharacterKey,
  gender: GenderKey
): LocationGenderedCharacterKey {
  if (allTravelerKeys.includes(charKey as TravelerKey))
    return `Traveler${gender}`
  return charKey as LocationGenderedCharacterKey
}

export function charKeyToLocCharKey(
  charKey: CharacterKey
): LocationCharacterKey {
  if (allTravelerKeys.includes(charKey as TravelerKey)) return 'Traveler'
  return charKey as LocationCharacterKey
}

export function locCharKeyToCharKey(
  locKey: LocationCharacterKey,
  travelerEle: ElementKey = 'anemo'
): CharacterKey {
  if (locKey === 'Traveler') return travelerEleMap[travelerEle] as CharacterKey
  return locKey as CharacterKey
}

export function sheetKeyToCharKey(sheetKey: CharacterSheetKey): CharacterKey {
  if (sheetKey.includes('Traveler'))
    return sheetKey.slice(0, -1) as CharacterKey
  else return sheetKey as CharacterKey
}

export function travelerElement(element: TravelerElementKey): TravelerKey {
  return ('Traveler' +
    element.toUpperCase().slice(0, 1) +
    element.slice(1)) as TravelerKey
}

export const absorbableEle = ['hydro', 'pyro', 'cryo', 'electro'] as const

export const travelerFKeys = [
  'TravelerAnemoF',
  'TravelerGeoF',
  'TravelerElectroF',
  'TravelerDendroF',
  'TravelerHydroF',
  'TravelerPyroF',
] as const
export const travelerMKeys = [
  'TravelerAnemoM',
  'TravelerGeoM',
  'TravelerElectroM',
  'TravelerDendroM',
  'TravelerHydroM',
  'TravelerPyroM',
] as const
export const allCharacterSheetKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerFKeys,
  ...travelerMKeys,
]
export type CharacterSheetKey = (typeof allCharacterSheetKeys)[number]

export const allowedAmpReactions: Partial<
  Record<ElementKey, AmplifyingReactionKey[]>
> = {
  pyro: ['vaporize', 'melt'],
  hydro: ['vaporize'],
  cryo: ['melt'],
  anemo: ['vaporize', 'melt'],
}
export const allowedAdditiveReactions: Partial<
  Record<ElementKey, AdditiveReactionKey[]>
> = {
  dendro: ['spread'],
  electro: ['aggravate'],
  anemo: ['aggravate'],
}

// Character-specific max level (100 for Somnia)
export const charMaxLevel = 100

export const getCharMaxLevel = (
  level: number,
  ascension: AscensionKey
): number => (level > 90 ? level : ascensionMaxLevel[ascension])

export const getCharLevelString = (
  level: number,
  ascension: AscensionKey
): string => `${level}/${getCharMaxLevel(level, ascension)}`

export function validateCharLevelAsc(
  inputLevel: number,
  inputAscension: AscensionKey
): { level: number; ascension: AscensionKey } {
  let level = inputLevel
  const ascension = inputAscension

  if (typeof level === 'number' && level > 90) {
    if (level > 97) level = 100
    else if (level > 92) level = 95
    else level = 90
    return { level, ascension: 6 as AscensionKey }
  }

  return validateLevelAsc(level, ascension, charMaxLevel)
}
