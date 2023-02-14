import { ArtifactSetKey, ArtifactSlotKey } from "@genshin-optimizer/consts";
import { ArtifactRarity, LocationKey } from "./consts";

export interface IArtifact {
  setKey: ArtifactSetKey,
  slotKey: ArtifactSlotKey,
  level: number,
  rarity: ArtifactRarity,
  mainStatKey: MainStatKey,
  location: LocationKey,
  lock: boolean,
  substats: ISubstat[],

  // GO-specific
  exclude?: boolean,
}
export interface ICachedArtifact extends IArtifact {
  id: string,
  mainStatVal: number,
  substats: ICachedSubstat[],
  probability?: number
}

export interface ISubstat {
  key: SubstatKey | ""
  value: number
}
export interface ICachedSubstat extends ISubstat {
  rolls: number[],
  efficiency: number,
  accurateValue: number
}
export const allMainStatKeys = ["hp", "hp_", "atk", "atk_", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_", "heal_"] as const
export const allSubstatKeys = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_",] as const
export type MainStatKey = typeof allMainStatKeys[number]
export type SubstatKey = typeof allSubstatKeys[number]

export const allArtifactRarityKeys = [5, 4, 3] as const
