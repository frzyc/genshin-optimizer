import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/consts'

export interface IArtifact {
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
  level: number
  rarity: ArtifactRarity
  mainStatKey: MainStatKey
  location: LocationCharacterKey | ''
  lock: boolean
  substats: ISubstat[]
}

export interface ISubstat {
  key: SubstatKey | ''
  value: number
}
