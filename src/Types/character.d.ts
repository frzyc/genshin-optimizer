import { WeaponLevel } from "../Data/WeaponData";
import { CharacterKey, ElementKey, WeaponKey, WeaponTypeKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import IConditional, { IConditionals } from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";

interface ICharacterSheetBase {
  name: Displayable,
  cardImg: string,
  thumbImg: string,
  star: Rarity,
  weaponTypeKey: WeaponTypeKey
  gender: string,
  constellationName: Displayable,
  titles: Array<string>,
  baseStat: IBaseStat
  baseStatCurve: IBaseStatCurve
  ascensions: ascension[],
}
interface ICharacterSheetTalent extends ICharacterSheetBase {
  elementKey: ElementKey
  talent: TalentSheet,
}
interface ICharacterSheetTalents extends ICharacterSheetBase {
  talents: Dict<ElementKey, TalentSheet>
}
export type ICharacterSheet = ICharacterSheetTalent | ICharacterSheetTalents
interface IBaseStat {
  hp: number
  atk: number
  def: number
}
interface IBaseStatCurve {
  hp: string
  atk: string
  def: string
}
interface ascension {
  props: {
    hp: number
    atk: number
    def: number
    [key: string]: number //TODO: [key: CharacterSpecializedStatKey]: number
  }
}

export interface ICharacter {
  characterKey: CharacterKey
  level: number,
  ascension: number,
  hitMode: HitModeKey
  elementKey?: ElementKey
  reactionMode: reactionModeKey | null
  equippedArtifacts: StrictDict<SlotKey, string>,
  conditionalValues: any,
  baseStatOverrides: object, //overriding the baseStat
  weapon: {
    key: WeaponKey
    levelKey: WeaponLevel
    refineIndex: number
    overrideMainVal: number
    overrideSubVal: number
  },
  talentLevelKeys: {
    auto: number
    skill: number
    burst: number
  },
  infusionAura: ElementKey | ""
  constellation: number
  artifacts?: any[] //from flex TODO: type
  buildSettings?: object
}

export type TalentSheet = {
  formula: IFormulaSheet,
  conditionals: IConditionals,
  sheets: Dict<string, TalentSheetElement>
}

export interface TalentSheetElement {
  name: Displayable, //talentName
  img: string,
  sections: Array<DocumentSection>,
  stats?: object,
}
export interface DocumentSection {
  canShow?: (stats: ICalculatedStats) => boolean,
  text?: Displayable | ((stats: ICalculatedStats) => Displayable),
  fields?: Array<IFieldDisplay>,
  conditional?: IConditional,
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
  [name: string]: (stats: ICalculatedStats) => FormulaItem
}

export type FormulaItem = [(s: any) => number, string[]]