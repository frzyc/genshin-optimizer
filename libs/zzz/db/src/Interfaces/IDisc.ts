import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
  LocationKey,
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
  location: LocationKey
  lock: boolean
  trash: boolean
  substats: ISubstat[]
}
