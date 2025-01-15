import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'

export interface ISubstat {
  key: DiscSubStatKey
  value: number // TODO: should this be the # of rolls?
}
export interface IDisc {
  setKey: DiscSetKey
  slotKey: DiscSlotKey
  level: number
  rarity: DiscRarityKey
  mainStatKey: DiscMainStatKey
  location: string // TODO: CharacterKey
  lock: boolean
  trash: boolean
  substats: ISubstat[]
}
