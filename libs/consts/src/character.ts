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

export const nonTravelerCharacterKeys = [
  'Albedo',
  'Alhaitham',
  'Aloy',
  'Amber',
  'AratakiItto',
  'Baizhu',
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
  'Freminet',
  'Ganyu',
  'Gorou',
  'HuTao',
  'Jean',
  'KaedeharaKazuha',
  'Kaeya',
  'KamisatoAyaka',
  'KamisatoAyato',
  'Kaveh',
  'Keqing',
  'Kirara',
  'Klee',
  'KujouSara',
  'KukiShinobu',
  'Layla',
  'Lisa',
  'Lynette',
  'Lyney',
  'Mika',
  'Mona',
  'Nahida',
  'Neuvillette',
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
export type NonTravelerCharacterKey = (typeof nonTravelerCharacterKeys)[number]

export const travelerElements = [
  'anemo',
  'geo',
  'electro',
  'dendro',
  'hydro',
] as const
export type TravelerElementKey = (typeof travelerElements)[number]

export const allTravelerKeys = [
  'TravelerAnemo',
  'TravelerGeo',
  'TravelerElectro',
  'TravelerDendro',
  'TravelerHydro',
] as const
export type TravelerKey = (typeof allTravelerKeys)[number]

export const travelerEleMap: Partial<Record<ElementKey, TravelerKey>> = {
  anemo: 'TravelerAnemo',
  geo: 'TravelerGeo',
  electro: 'TravelerElectro',
  dendro: 'TravelerDendro',
  hydro: 'TravelerHydro',
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

export function locCharKeyToCharKey(
  locKey: LocationCharacterKey,
  travelerEle: ElementKey = 'anemo'
): CharacterKey {
  if (locKey === 'Traveler') return travelerEleMap[travelerEle] as CharacterKey
  return locKey as CharacterKey
}

export function travelerElement(element: TravelerElementKey): TravelerKey {
  return ('Traveler' +
    element.toUpperCase().slice(0, 1) +
    element.slice(1)) as TravelerKey
}
