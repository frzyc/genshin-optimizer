import { CharacterKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import IConditional, { IConditionals } from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";
export interface ICharacterSheet {
  name: string,
  cardImg: string,
  thumbImg: string,
  star: Rarity,
  elementKey: ElementKey
  weaponTypeKey: WeaponTypeKey
  gender: string,
  constellationName: string,
  titles: Array<string>,
  baseStat: IBaseStat
  specializeStat: ISpecializedStat,
  formula: object, //TODO: IFormulaSheet when all sheets are done
  conditionals: IConditionals,
  talent: TalentSheet,
}
interface IBaseStat {
  characterHP: number[]
  characterATK: number[]
  characterDEF: number[]
}
interface ISpecializedStat {
  key: string;
  value: number[]
}

export interface ICharacter {
  characterKey: CharacterKey
  levelKey: string
  hitMode: string
  reactionMode: string | null
  equippedArtifacts: StrictDict<SlotKey, string>,
  conditionalValues: any,
  baseStatOverrides: {},//overriding the baseStat
  weapon: {
    key: string
    levelKey: string
    refineIndex: number
    overrideMainVal: number
    overrideSubVal: number
  },
  talentLevelKeys: {
    auto: number
    skill: number
    burst: number
  },
  infusionAura: string
  constellation: number
  artifacts?: any[]//from flex TODO: type
  buildSettings?: object
}

export type TalentSheet = Dict<string, TalentSheetElement>

export interface TalentSheetElement {
  name: string, //talentName
  img: string,
  document: Array<DocumentSection>,
  stats?: object,
}
export interface DocumentSection {
  canShow?: (stats: ICalculatedStats) => boolean,
  text?: Displayable | ((stats: ICalculatedStats) => Displayable),
  fields?: Array<IFieldDisplay>,
  conditional?: IConditional,
}

export type IFormulaSheets = Dict<string, IFormulaSheet>

export interface IFormulaSheet {
  normal: ISubFormula
  charged: ISubFormula
  plunging: ISubFormula
  skill: ISubFormula
  burst: ISubFormula
  [name: string]: ISubFormula
}

interface ISubFormula {
  [name: string]: (stats: any) => FormulaItem
}

export type FormulaItem = [(s: any) => number, string[]]