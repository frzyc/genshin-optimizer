import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import type { ArtifactRarity } from './consts'

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
export interface ICachedArtifact extends IArtifact {
  id: string
  mainStatVal: number
  substats: ICachedSubstat[]
  probability?: number
}

export interface ISubstat {
  key: SubstatKey | ''
  value: number
}
export interface ICachedSubstat extends ISubstat {
  rolls: number[]
  efficiency: number
  accurateValue: number
}

export const allArtifactRarityKeys = [5, 4, 3] as const
