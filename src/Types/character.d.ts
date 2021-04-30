import { CharacterKey } from "./consts";
import IConditional, { IConditionals } from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";
import { WeaponType } from "./weapon";

export interface ICharacterSheet {
  name: string,
  cardImg: string,
  thumbImg: string,
  star: number,
  elementKey: string, //TODO: enum?
  weaponTypeKey: WeaponType, //TODO: enum?
  gender: string,
  constellationName: string,
  titles: Array<string>,
  baseStat: object, //TODO: custom interface
  specializeStat: ISpecializedStat,
  formula: object,
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
  equippedArtifacts: object,
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
}

export type TalentSheet = Dict<string, TalentSheetElement>

export interface TalentSheetElement {
  name: string, //talentName
  img: string,
  document: Array<DocumentSection>,
  stats?: object,
}
export interface DocumentSection {
  canShow?: (stats: any) => boolean,
  text?: Displayable | ((stats: any) => Displayable),
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
  etc?: ISubFormula
}

interface ISubFormula {
  [name: string]: (cnst: any) => FormulaItem
}

export type FormulaItem = [(stat: any) => number, string[]]