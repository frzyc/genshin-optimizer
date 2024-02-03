import type {
  LocationKey,
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'

export interface IRelic {
  setKey: RelicSetKey
  slotKey: RelicSlotKey
  level: number
  rarity: RelicRarityKey
  mainStatKey: RelicMainStatKey
  location: LocationKey
  lock: boolean
  substats: ISubstat[]
}

export interface ISubstat {
  key: RelicSubStatKey | ''
  value: number
}
