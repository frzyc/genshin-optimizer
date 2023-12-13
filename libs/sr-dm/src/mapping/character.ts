import type {
  NonTrailblazerCharacterKey,
  PathKey,
  RarityKey,
  TrailblazerGenderedKey,
} from '@genshin-optimizer/sr-consts'
import type { AvatarRarity } from '../dm'

export const characterIdMap: Record<
  string,
  NonTrailblazerCharacterKey | TrailblazerGenderedKey
> = {
  '1001': 'March7th',
  '1002': 'DanHeng',
  '1003': 'Himeko',
  '1004': 'Welt',
  '1005': 'Kafka',
  '1006': 'SilverWolf',
  '1008': 'Arlan',
  '1009': 'Asta',
  '1013': 'Herta',
  '1101': 'Bronya',
  '1102': 'Seele',
  '1103': 'Serval',
  '1104': 'Gepard',
  '1105': 'Natasha',
  '1106': 'Pela',
  '1107': 'Clara',
  '1108': 'Sampo',
  '1109': 'Hook',
  '1201': 'Qingque',
  '1202': 'Tingyun',
  '1203': 'Luocha',
  '1204': 'JingYuan',
  '1206': 'Sushang',
  '1209': 'Yanqing',
  '1211': 'Bailu',
  '8001': 'TrailblazerPhysicalM',
  '8002': 'TrailblazerPhysicalF',
  '8003': 'TrailblazerFireM',
  '8004': 'TrailblazerFireF',
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
