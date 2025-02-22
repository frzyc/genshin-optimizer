import type {
  CharacterGenderedKey,
  ElementalTypeKey,
  PathKey,
  RarityKey,
} from '@genshin-optimizer/sr/consts'
import type { AvatarRarity } from '../dm'
import type { AvatarDamageType } from '../dm/character/AvatarConfig'

export const characterIdMap: Record<string, CharacterGenderedKey> = {
  1001: 'March7th',
  1002: 'DanHeng',
  1003: 'Himeko',
  1004: 'Welt',
  1005: 'Kafka',
  1006: 'SilverWolf',
  1008: 'Arlan',
  1009: 'Asta',
  1013: 'Herta',
  1101: 'Bronya',
  1102: 'Seele',
  1103: 'Serval',
  1104: 'Gepard',
  1105: 'Natasha',
  1106: 'Pela',
  1107: 'Clara',
  1108: 'Sampo',
  1109: 'Hook',
  1110: 'Lynx',
  1111: 'Luka',
  1112: 'TopazAndNumby',
  1201: 'Qingque',
  1202: 'Tingyun',
  1203: 'Luocha',
  1204: 'JingYuan',
  1205: 'Blade',
  1206: 'Sushang',
  1207: 'Yukong',
  1208: 'FuXuan',
  1209: 'Yanqing',
  1210: 'Guinaifen',
  1211: 'Bailu',
  1212: 'Jingliu',
  1213: 'DanHengImbibitorLunae',
  1214: 'Xueyi',
  1215: 'Hanya',
  1217: 'Huohuo',
  1221: 'Yunli',
  1224: 'March7thTheHunt',
  1301: 'Gallagher',
  1302: 'Argenti',
  1303: 'RuanMei',
  1304: 'Aventurine',
  1305: 'DrRatio',
  1306: 'Sparkle',
  1307: 'BlackSwan',
  1308: 'Acheron',
  1309: 'Robin',
  1310: 'Firefly',
  1312: 'Misha',
  1314: 'Jade',
  1315: 'Boothill',
  8001: 'TrailblazerPhysicalM',
  8002: 'TrailblazerPhysicalF',
  8003: 'TrailblazerFireM',
  8004: 'TrailblazerFireF',
  8005: 'TrailblazerImaginaryM',
  8006: 'TrailblazerImaginaryF',
} as const
export type AvatarId = keyof typeof characterIdMap

export const avatarBaseTypeMap: Record<string, PathKey> = {
  Mage: 'Erudition',
  Knight: 'Preservation',
  Priest: 'Abundance',
  Warlock: 'Nihility',
  Warrior: 'Destruction',
  Shaman: 'Harmony',
  Rogue: 'TheHunt',
} as const

export type AvatarBaseTypeKey = keyof typeof avatarBaseTypeMap

export const avatarRarityMap: Record<AvatarRarity, RarityKey> = {
  CombatPowerAvatarRarityType4: 4,
  CombatPowerAvatarRarityType5: 5,
}

export const avatarDamageTypeMap: Record<AvatarDamageType, ElementalTypeKey> = {
  Physical: 'physical',
  Quantum: 'quantum',
  Thunder: 'lightning',
  Ice: 'ice',
  Wind: 'wind',
  Fire: 'fire',
  Imaginary: 'imaginary',
}
