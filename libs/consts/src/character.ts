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
] as const
export type RegionKey = (typeof allRegionKeys)[number]

export const allAscensionKeys = [0, 1, 2, 3, 4, 5, 6] as const
export type AscensionKey = (typeof allAscensionKeys)[number]

export const allMoveKeys = [
  'normal',
  'charged',
  'plunging',
  'skill',
  'burst',
  'elemental',
] as const
export type MoveKey = (typeof allMoveKeys)[number]

export const nonTravelerCharacterKeys = [
  'Albedo',
  'Alhaitham',
  'Aloy',
  'Amber',
  'AratakiItto',
  'Barbara',
  'Beidou',
  'Bennett',
  'Candace',
  'Chongyun',
  'Collei',
  'Cyno',
  'Dehya',
  'Diluc',
  'Diona',
  'Dori',
  'Eula',
  'Faruzan',
  'Fischl',
  'Ganyu',
  'Gorou',
  'HuTao',
  'Jean',
  'KaedeharaKazuha',
  'Kaeya',
  'KamisatoAyaka',
  'KamisatoAyato',
  'Keqing',
  'Klee',
  'KujouSara',
  'KukiShinobu',
  'Layla',
  'Lisa',
  'Mika',
  'Mona',
  'Nahida',
  'Nilou',
  'Ningguang',
  'Noelle',
  'Qiqi',
  'RaidenShogun',
  'Razor',
  'Rosaria',
  'SangonomiyaKokomi',
  'Sayu',
  'Shenhe',
  'ShikanoinHeizou',
  'Somnia',
  'Sucrose',
  'Tartaglia',
  'Thoma',
  'Tighnari',
  'Venti',
  'Wanderer',
  'Xiangling',
  'Xiao',
  'Xingqiu',
  'Xinyan',
  'YaeMiko',
  'Yanfei',
  'Yaoyao',
  'Yelan',
  'Yoimiya',
  'YunJin',
  'Zhongli',
] as const

export const allTravelerKeys = [
  'TravelerAnemo',
  'TravelerGeo',
  'TravelerElectro',
  'TravelerDendro',
] as const
export type TravelerKey = (typeof allTravelerKeys)[number]

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

export const allLocationCharacterKeys = [
  ...nonTravelerCharacterKeys,
  'Traveler',
] as const
export type LocationCharacterKey = (typeof allLocationCharacterKeys)[number]

export type LocationKey = LocationCharacterKey | ''

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
