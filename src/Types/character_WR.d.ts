import { UIData } from "../Formula/api";
import { EleEnemyResKey, StatKey } from "../KeyMap";
import { BuildSetting } from "./Build";
import { ICachedCharacter } from "./character";
import { CharacterKey, ElementKey, HitModeKey, ReactionModeKey, SlotKey, WeaponTypeKey } from "./consts";
import IConditional, { IConditionalValues } from "./IConditional_WR";
import { IFieldDisplay } from "./IFieldDisplay_WR";
import { DocumentSection } from "./sheet";
import { BasicStats, ICalculatedStats } from "./stats";
export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: number
  talent: {
    auto: number
    skill: number
    burst: number
  }

  team: [teammate1: CharacterKey | "", teammate2: CharacterKey | "", teammate3: CharacterKey | ""]
  // GO-specific
  hitMode: HitModeKey
  elementKey?: ElementKey
  reactionMode: ReactionModeKey | ""
  conditional: IConditionalValues
  bonusStats: Partial<Record<StatKey, number>>
  enemyOverride: Partial<Record<EleEnemyResKey | "enemyLevel" | "enemyDefRed_" | "enemyDefIgn_", number>>
  infusionAura: ElementKey | ""
  buildSettings?: BuildSetting
  compareData: boolean
}
export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: StrictDict<SlotKey, string>
  equippedWeapon: string
}

export type TalentSheetElementKey = "auto" | "skill" | "burst" | "sprint" | "passive" | "passive1" | "passive2" | "passive3" | "constellation1" | "constellation2" | "constellation3" | "constellation4" | "constellation5" | "constellation6"
export type TalentSheet = {
  sheets: Dict<TalentSheetElementKey, TalentSheetElement>
}

export interface TalentSheetElement {
  name: Displayable //talentName
  img: string
  sections: DocumentSection[]
}

export interface IFormulaSheet {
  normal: ISubFormula
  charged: ISubFormula
  plunging: ISubFormula
  skill: ISubFormula
  burst: ISubFormula
  [name: string]: ISubFormula
}

interface ISubFormula {
  [name: string]: (stats: BasicStats) => FormulaItem
}

export type FormulaItem = [(s: ICalculatedStats) => number, string[]]
