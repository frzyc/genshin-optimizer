import { BuildSetting } from "./Build";
import { CharacterKey, ElementKey, HitModeKey, ReactionModeKey, SlotKey, WeaponKey, WeaponTypeKey } from "./consts";
import { BasicStats, ICalculatedStats } from "./stats";
import IConditional, { IConditionals } from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";
import { StatKey } from "./artifact";

interface ICharacterSheetBase {
  name: Displayable,
  cardImg: string,
  thumbImg: string,
  star: Rarity,
  weaponTypeKey: WeaponTypeKey
  gender: string,
  constellationName: Displayable,
  title: Displayable,
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

export interface IFlexCharacter {
  characterKey: CharacterKey
  level: number,
  ascension: number,
  hitMode: HitModeKey
  elementKey?: ElementKey
  reactionMode: ReactionModeKey | null
  conditionalValues: any,
  baseStatOverrides: object, //overriding the baseStat
  weapon: {
    key: WeaponKey
    level: number,
    ascension: number,
    refineIndex: number
  },
  talentLevelKeys: {
    auto: number
    skill: number
    burst: number
  },
  infusionAura: ElementKey | ""
  constellation: number
  buildSettings?: BuildSetting
}
export interface ICharacter extends IFlexCharacter {
  equippedArtifacts: StrictDict<SlotKey, string>,
  artifacts?: any[] //from flex TODO: type
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
  canShow?: (stats: BasicStats) => boolean,
  text?: Displayable | ((stats: BasicStats) => Displayable),
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
  [name: string]: (stats: BasicStats) => FormulaItem
}

export type FormulaItem = [(s: ICalculatedStats) => number, string[]]
