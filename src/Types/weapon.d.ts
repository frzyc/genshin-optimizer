import { WeaponData } from "../../pipeline";
import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character";
import { Rarity, WeaponTypeKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import { IConditionals } from "./IConditional";


export type IWeaponSheets = Dict<string, IWeaponSheet>

export interface IWeaponSheet extends WeaponData {
  img: string;
  stats?: object | ((stats: ICalculatedStats) => object | false)
  conditionals?: IConditionals
  document?: DocumentSection[],//TODO: not optional?
}