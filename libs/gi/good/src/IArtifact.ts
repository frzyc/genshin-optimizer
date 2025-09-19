import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'

// GOOD 3 and above
export interface IArtifact extends IBaseArtifact {
  totalRolls?: number // 3-9 for valid 5* artifacts; includes starting rolls
  astralMark?: boolean // Favorite star in-game
  elixirCrafted?: boolean // Flag for if the artifact was created using Sanctifying Elixir. This guarantees the main stat + at least 2 rolls on the first 2 substats
  unactivatedSubstats: ISubstat[] // Unactivated substat(s). Once a substat is activated, it should be moved to `substats` instead
}

export interface ISubstat extends IBaseSubstat {
  initialValue?: number // Initial roll of the artifact, if it is known. This includes the first roll of this stat, even if it was not revealed initially e.g. from `unactivatedSubstats`
}

// GOOD 2 and below
export interface IBaseArtifact {
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
  level: number
  rarity: ArtifactRarity
  mainStatKey: MainStatKey
  location: LocationCharacterKey | ''
  lock: boolean
  substats: ISubstat[]
}

export interface IBaseSubstat {
  key: SubstatKey | ''
  value: number
}
