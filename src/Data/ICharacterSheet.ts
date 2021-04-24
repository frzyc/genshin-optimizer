import IConditional, { IConditionals } from "../Conditional/IConditional";
import { IFieldDisplay } from "./IFieldDisplay";

export default interface ICharacterSheet {
  name: string;
  cardImg: string;
  thumbImg: string;
  star: number;
  elementKey: string;//TODO: enum?
  weaponTypeKey: string;//TODO: enum?
  gender: string;
  constellationName: string;
  titles: Array<string>;
  baseStat: object;//TODO: custom interface
  specializeStat: object;//TODO: interface
  formula: object;
  conditionals: IConditionals;
  talent: TalentSheet;
}

export interface TalentSheet {
  [key: string]: TalentSheetElement
}
export interface TalentSheetElement {
  name: string; //talentName
  img: string;
  document: Array<DocumentSection>;
  stats?: object;
  talentBoost?: object;
}
export interface DocumentSection {
  canShow?: (stats: any) => boolean;
  text?: string | JSX.Element | ((stats: any) => JSX.Element);
  fields?: Array<IFieldDisplay>;
  conditional?: IConditional;
}
