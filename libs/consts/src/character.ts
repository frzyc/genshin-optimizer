export const genderKeys = ["F", "M"] as const
export type Gender = typeof genderKeys[number]

export const nonTravelerCharacterKeys = [
  "Albedo",
  "Alhaitham",
  "Aloy",
  "Amber",
  "AratakiItto",
  "Barbara",
  "Beidou",
  "Bennett",
  "Candace",
  "Chongyun",
  "Collei",
  "Cyno",
  "Diluc",
  "Diona",
  "Dori",
  "Eula",
  "Faruzan",
  "Fischl",
  "Ganyu",
  "Gorou",
  "HuTao",
  "Jean",
  "KaedeharaKazuha",
  "Kaeya",
  "KamisatoAyaka",
  "KamisatoAyato",
  "Keqing",
  "Klee",
  "KujouSara",
  "KukiShinobu",
  "Layla",
  "Lisa",
  "Mona",
  "Nahida",
  "Nilou",
  "Ningguang",
  "Noelle",
  "Qiqi",
  "RaidenShogun",
  "Razor",
  "Rosaria",
  "SangonomiyaKokomi",
  "Sayu",
  "Shenhe",
  "ShikanoinHeizou",
  "Sucrose",
  "Tartaglia",
  "Thoma",
  "Tighnari",
  "Venti",
  "Wanderer",
  "Xiangling",
  "Xiao",
  "Xingqiu",
  "Xinyan",
  "YaeMiko",
  "Yanfei",
  "Yaoyao",
  "Yelan",
  "Yoimiya",
  "YunJin",
  "Zhongli",
] as const

export const travelerKeys = [
  "TravelerAnemo",
  "TravelerGeo",
  "TravelerElectro",
  "TravelerDendro",
] as const
export type TravelerKey = typeof travelerKeys[number]

export const locationGenderedCharacterKeys = [
  ...nonTravelerCharacterKeys,
  "TravelerF",
  "TravelerM"
] as const
export type LocationGenderedCharacterKey = typeof locationGenderedCharacterKeys[number]

export const allCharacterKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerKeys
] as const
export type CharacterKey = typeof allCharacterKeys[number]

export function characterKeyToLocationGenderedCharacterKey(charKey: CharacterKey, gender: Gender): LocationGenderedCharacterKey {
  if (travelerKeys.includes(charKey as TravelerKey)) return `Traveler${gender}`
  return charKey as LocationGenderedCharacterKey
}
