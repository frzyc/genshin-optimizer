
/**
 * @deprecated
 */
export type ICharacterSheet = {}
/**
 * @deprecated
 */
export type TalentSheetElementKey = "auto" | "skill" | "burst" | "sprint" | "passive" | "passive1" | "passive2" | "passive3" | "constellation1" | "constellation2" | "constellation3" | "constellation4" | "constellation5" | "constellation6"
/**
 * @deprecated
 */
export type TalentSheet = {
  formula: IFormulaSheet
  sheets: Dict<TalentSheetElementKey, TalentSheetElement>
}
/**
 * @deprecated
 */
export interface TalentSheetElement {
  name: Displayable //talentName
  img: string
  sections: DocumentSection[]
}
/**
 * @deprecated
 */
export interface DocumentSection {
  canShow?: (stats: any) => boolean
  text?: Displayable | ((stats: any) => Displayable)
  fields?: any[]
  conditional?: any
}
/**
 * @deprecated
 */
export interface IFormulaSheet {
  normal: ISubFormula
  charged: ISubFormula
  plunging: ISubFormula
  skill: ISubFormula
  burst: ISubFormula
  [name: string]: ISubFormula
}
/**
 * @deprecated
 */
interface ISubFormula {
  [name: string]: (stats: any) => FormulaItem
}
/**
 * @deprecated
 */
export type FormulaItem = [(s: any) => number, string[]]
