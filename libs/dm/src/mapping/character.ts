import type { NonTravelerCharacterKey } from '@genshin-optimizer/consts'

export type InternalElement =
  | 'Fire'
  | 'Grass'
  | 'Electric'
  | 'Wind'
  | 'Ice'
  | 'Water'
  | 'Rock'
type ElementKey =
  | 'pyro'
  | 'dendro'
  | 'electro'
  | 'anemo'
  | 'cryo'
  | 'hydro'
  | 'geo'
export const elementMap: Record<InternalElement, ElementKey> = {
  Fire: 'pyro',
  Grass: 'dendro',
  Electric: 'electro',
  Wind: 'anemo',
  Ice: 'cryo',
  Water: 'hydro',
  Rock: 'geo',
}

export type AvatarAssocType =
  | 'ASSOC_TYPE_MONDSTADT'
  | 'ASSOC_TYPE_LIYUE'
  | 'ASSOC_TYPE_INAZUMA'
  | 'ASSOC_TYPE_SUMERU'
  | 'ASSOC_TYPE_FONTAINE'
  | 'ASSOC_TYPE_NATLAN'
  | 'ASSOC_TYPE_FATUI'
  | 'ASSOC_TYPE_KHAENRIAH'
  | 'ASSOC_TYPE_MAINACTOR'
  | 'ASSOC_TYPE_RANGER'
type Regionkey =
  | 'mondstadt'
  | 'liyue'
  | 'inazuma'
  | 'sumeru'
  | 'fontaine'
  | 'natlan'
  | 'snezhnaya'
  | 'khaenriah'
export const regionMap: Record<AvatarAssocType, Regionkey | undefined> = {
  ASSOC_TYPE_MONDSTADT: 'mondstadt',
  ASSOC_TYPE_LIYUE: 'liyue',
  ASSOC_TYPE_INAZUMA: 'inazuma',
  ASSOC_TYPE_SUMERU: 'sumeru',
  ASSOC_TYPE_FONTAINE: 'fontaine',
  ASSOC_TYPE_NATLAN: 'natlan',
  ASSOC_TYPE_FATUI: 'snezhnaya',
  ASSOC_TYPE_KHAENRIAH: 'khaenriah',
  ASSOC_TYPE_MAINACTOR: undefined, // Traveler
  ASSOC_TYPE_RANGER: undefined, // Aloy
}

export const characterIdMap: Record<
  string,
  NonTravelerCharacterKey | 'TravelerM' | 'TravelerF'
> = {
  //10000000: Kate
  //10000001: Kate
  10000002: 'KamisatoAyaka',
  10000003: 'Jean',
  10000005: 'TravelerM', // traveler_male
  10000006: 'Lisa',
  10000007: 'TravelerF', // Traveler_female
  10000014: 'Barbara',
  10000015: 'Kaeya',
  10000016: 'Diluc',
  10000020: 'Razor',
  10000021: 'Amber',
  10000022: 'Venti',
  10000023: 'Xiangling',
  10000024: 'Beidou',
  10000025: 'Xingqiu',
  10000026: 'Xiao',
  10000027: 'Ningguang',
  10000029: 'Klee',
  10000030: 'Zhongli',
  10000031: 'Fischl',
  10000032: 'Bennett',
  10000033: 'Tartaglia',
  10000034: 'Noelle',
  10000035: 'Qiqi',
  10000036: 'Chongyun',
  10000037: 'Ganyu',
  10000038: 'Albedo',
  10000039: 'Diona',
  10000041: 'Mona',
  10000042: 'Keqing',
  10000043: 'Sucrose',
  10000044: 'Xinyan',
  10000045: 'Rosaria',
  10000046: 'HuTao',
  10000047: 'KaedeharaKazuha',
  10000048: 'Yanfei',
  10000049: 'Yoimiya',
  10000050: 'Thoma',
  10000051: 'Eula',
  10000052: 'RaidenShogun',
  10000053: 'Sayu',
  10000054: 'SangonomiyaKokomi',
  10000055: 'Gorou',
  10000056: 'KujouSara',
  10000057: 'AratakiItto',
  10000058: 'YaeMiko',
  10000059: 'ShikanoinHeizou',
  10000060: 'Yelan',
  10000061: 'Kirara',
  10000062: 'Aloy',
  10000063: 'Shenhe',
  10000064: 'YunJin',
  10000065: 'KukiShinobu',
  10000066: 'KamisatoAyato',
  10000067: 'Collei',
  10000068: 'Dori',
  10000069: 'Tighnari',
  10000070: 'Nilou',
  10000071: 'Cyno',
  10000072: 'Candace',
  10000073: 'Nahida',
  10000074: 'Layla',
  10000075: 'Wanderer',
  10000076: 'Faruzan',
  10000077: 'Yaoyao',
  10000078: 'Alhaitham',
  10000079: 'Dehya',
  10000080: 'Mika',
  10000081: 'Kaveh',
  10000082: 'Baizhu',
  10000083: 'Lynette',
  10000084: 'Lyney',
  10000085: 'Freminet',
  10000087: 'Neuvillette',
  // 11000008: "TEMPLATE",
  // 11000009: "TEMPLATE",
  // 11000010: "TEMPLATE",
  // 11000011: "TEMPLATE",
  // 11000025: "TEMPLATE", Akuliya
  // 11000026: "TEMPLATE", Yaoyao
  // 11000028: "TEMPLATE", Shiro Maiden
  // 11000030: "TEMPLATE", Greatsword Maiden
  // 11000035: "TEMPLATE", Lance Warrioress
} as const
export type CharacterId = keyof typeof characterIdMap
