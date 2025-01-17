import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'

export interface ISubstat {
  key: DiscSubStatKey
  upgrades: number // This is the number of upgrades this sub receives.
}
export interface IDisc {
  setKey: DiscSetKey
  slotKey: DiscSlotKey
  level: number // 0-15
  rarity: DiscRarityKey
  mainStatKey: DiscMainStatKey
  location: string // TODO: CharacterKey
  lock: boolean
  trash: boolean
  substats: ISubstat[]
}
