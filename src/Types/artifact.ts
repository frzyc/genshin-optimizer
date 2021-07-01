import { ArtifactSetKey, CharacterKey, Rarity, SetNum, SlotKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import IConditional, { IConditionalComplex, IConditionals } from "./IConditional";

export type IArtifactSheets = StrictDict<ArtifactSetKey, IArtifactSheet>

export interface IArtifactSheet {
  name: string,
  rarity: readonly Rarity[],
  pieces: Dict<SlotKey, string>,
  icons: Dict<SlotKey, string>,
  conditionals?: IConditionals,
  setEffects: Dict<SetNum, SetEffectEntry>
}
export interface SetEffectEntry {
  text: (Displayable | ((stats: ICalculatedStats) => Displayable)),
  stats?: StatDict | ((arg0: ICalculatedStats) => (StatDict | false))
  conditional?: (IConditional | IConditionalComplex),
  conditionals?: IConditionals,
}

export type StatArr = { key: StatKey, value: number }[]
export type StatDict = Dict<StatKey, number>

export interface IArtifact {
  id?: string,
  setKey: ArtifactSetKey,
  numStars: Rarity,
  level: number,
  slotKey: SlotKey,
  mainStatKey: MainStatKey,
  mainStatVal?: number,
  substats: Substat[],
  location: CharacterKey | "",

  lock: boolean,
}

export interface Substat {
  key: SubstatKey | "",
  value: number,

  rolls?: number[],
  efficiency?: number,
}
export type StatKey = MainStatKey | SubstatKey | ReactionDMGStatKey | MoveDMGStatKey | ElementalRESStatKey | SpecializedStatKey

type ElementalRESStatKey = "physical_res_" | "anemo_res_" | "geo_res_" | "electro_res_" | "hydro_res_" | "pyro_res_" | "cryo_res_"
type ReactionDMGStatKey = "overloaded_dmg_" | "shattered_dmg_" | "electrocharged_dmg_" | "superconduct_dmg_" | "swirl_dmg_" | "vaporize_dmg_" | "melt_dmg_" | "burning_dmg_" | "crystalize_dmg_"
type MoveDMGStatKey = "normal_dmg_" | "charged_dmg_" | "skill_dmg_" | "burst_dmg_"

export const allMainStatKeys = ["hp", "hp_", "atk", "atk_", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "heal_"] as const
export const allSubstats = ["hp", "hp_", "atk", "atk_", "def_", "def", "eleMas", "enerRech_", "critRate_", "critDMG_",] as const

// TODO: Check if these actually applies
type SpecializedStatKey = "charged_critRate_" | "powShield_" | "incHeal_"

export type MainStatKey = typeof allMainStatKeys[number]
export type CompressMainStatKey = "hp" | "hp_" | "atk" | "atk_" | "def_" | "eleMas" | "enerRech_" | "critRate_" | "critDMG_" | "physical_dmg_" | "ele_dmg_" | "heal_"
export type SubstatKey = typeof allSubstats[number]
