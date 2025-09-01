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
  startingRolls?: number // 3-4 for valid 5* artifacts; If a 4th substat is in substats array, and this value is 3, the 4th substat is a revealed stat, but should not be factored into calculation
  astralMark?: boolean // Favorite star in-game
  discard?: boolean // Trash icon in-game
  elixirCrafted?: boolean // Flag for if the artifact was created using Sanctifying Elixir. This guarantees the main stat + 2 additional rolls on the first 2 substats
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

export interface ISubstat {
  key: SubstatKey | ''
  value: number
}
