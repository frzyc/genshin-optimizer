import { ArtifactSetKey, CharacterKey, ElementKey, Rarity, SetNum, SlotKey } from "./consts";
import { BonusStats, BasicStats } from "./stats";
import { IConditionals } from "./IConditional";
import { DocumentSection } from "./character";

export type IArtifactSheets = StrictDict<ArtifactSetKey, IArtifactSheet>

export interface IArtifactSheet {
  name: string, // only to stored the English name for OCR, otherwise, should come from localization pipeline
  rarity: readonly Rarity[],
  icons: Dict<SlotKey, string>,
  conditionals?: IConditionals,
  setEffects: Dict<SetNum, SetEffectEntry>
}
export interface SetEffectEntry {
  stats?: BonusStats | ((stats: BasicStats) => BonusStats)
  document?: DocumentSection[],
}

export interface IFlexArtifact {
  id: string
  setKey: ArtifactSetKey
  numStars: Rarity
  level: number,
  slotKey: SlotKey,
  mainStatKey: MainStatKey,
  substats: IFlexSubstat[],

  location: CharacterKey | "",
  lock: boolean,
}
export interface IArtifact extends IFlexArtifact {
  mainStatVal?: number,
  substats: Substat[],

  location: CharacterKey | "",
  lock: boolean,
}

export interface IFlexSubstat {
  key: SubstatKey | ""
  value: number
}
export interface Substat extends IFlexSubstat {
  rolls?: number[],
  efficiency?: number,
}
export type StatKey = MainStatKey | SubstatKey | ReactionDMGStatKey | MoveDMGStatKey | ElementalRESStatKey | ElementalEnemyRESStatKey | SpecializedStatKey

type ElementalRESStatKey = `${ElementKey | "physical"}_res_`
type ElementalEnemyRESStatKey = `${ElementKey | "physical"}_enemyRes_`
type ReactionDMGStatKey = "overloaded_dmg_" | "shattered_dmg_" | "electrocharged_dmg_" | "superconduct_dmg_" | "swirl_dmg_" | "vaporize_dmg_" | "melt_dmg_" | "burning_dmg_" | "crystalize_dmg_"
type MoveDMGStatKey = "normal_dmg_" | "charged_dmg_" | "skill_dmg_" | "burst_dmg_"

export const allMainStatKeys = ["hp", "hp_", "atk", "atk_", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "heal_"] as const
export const allSubstats = ["hp", "hp_", "atk", "atk_", "def_", "def", "eleMas", "enerRech_", "critRate_", "critDMG_",] as const

// TODO: Check if these actually applies
type SpecializedStatKey = "normal_critRate_" | "charged_critRate_" | "plunging_dmg_" | "powShield_" | "enemyDEFRed_" | "skillCDRed_" | "incHeal_" | "weakspotDMG_" | "dmg_" | "moveSPD_" | "staminaDec_" | "atkSPD_" | "cdRed_" | "finalHP" | "finalATK" | "finalDEF"

export type MainStatKey = typeof allMainStatKeys[number]
export type SubstatKey = typeof allSubstats[number]
