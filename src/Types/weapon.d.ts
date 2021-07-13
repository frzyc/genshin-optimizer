import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character";
import { Rarity, WeaponTypeKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import { IConditionals } from "./IConditional";

export type IWeaponSheets = Dict<string, IWeaponSheet>

export interface IWeaponSheet {
  name: Displayable; //TODO: REMOVE after pipeline
  weaponType: WeaponTypeKey;
  img: string;
  rarity: Rarity;
  passiveName: Displayable; //TODO: REMOVE after pipeline
  passiveDescription: string | ((stats: ICalculatedStats) => Displayable) //TODO: REMOVE after pipeline
  description: Displayable; //TODO: REMOVE after pipeline
  baseStats: { //TODO: REMOVE after pipeline
    main: number[],
    substatKey: string,
    sub?: number[]
  },
  stats?: object | ((stats: ICalculatedStats) => object | false)
  conditionals?: IConditionals
  document?: DocumentSection[],
}