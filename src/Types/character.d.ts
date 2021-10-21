import { IArtifact } from "./artifact";
import { BuildSetting } from "./Build";
import { CharacterKey, ElementKey, HitModeKey, ReactionModeKey, SlotKey, WeaponTypeKey } from "./consts";
import IConditional, { IConditionals } from "./IConditional";
import { IFieldDisplay } from "./IFieldDisplay";
import { BasicStats, ICalculatedStats } from "./stats";
import { ICachedWeapon } from "./weapon"

interface ICharacterSheetBase {
  name: Displayable
  cardImg: string
  thumbImg: string
  thumbImgSide: string
  barImg?:string
  bannerImg?:string
  star: Rarity
  weaponTypeKey: WeaponTypeKey
  gender: string
  constellationName: Displayable
  title: Displayable
  baseStat: IBaseStat
  baseStatCurve: IBaseStatCurve
  ascensions: ascension[]
}
interface ICharacterSheetTalent extends ICharacterSheetBase {
  elementKey: ElementKey
  talent: TalentSheet
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
  key: CharacterKey
  level: number
  constellation: number
  ascension: number
  talent: {
    auto: number
    skill: number
    burst: number
  }

  // GO-specific
  hitMode: HitModeKey
  elementKey?: ElementKey
  reactionMode: ReactionModeKey | ""
  conditionalValues: any
  bonusStats: object
  infusionAura: ElementKey | ""
  buildSettings?: BuildSetting
}
export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: StrictDict<SlotKey, string>
  equippedWeapon: string
}

export type TalentSheet = {
  formula: IFormulaSheet
  conditionals: IConditionals
  sheets: Dict<string, TalentSheetElement>
}

export interface TalentSheetElement {
  name: Displayable //talentName
  img: string
  sections: Array<DocumentSection>
  stats?: object
}
export interface DocumentSection {
  canShow?: (stats: BasicStats) => boolean
  text?: Displayable | ((stats: BasicStats) => Displayable)
  fields?: Array<IFieldDisplay>
  conditional?: IConditional
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
