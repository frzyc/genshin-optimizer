import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character";
import { Rarity, WeaponTypeKey } from "./consts";
import ICalculatedStats from "./ICalculatedStats";
import { IConditionals } from "./IConditional";

export type IWeaponSheets = Dict<string, IWeaponSheet>

export interface IWeaponSheet {
  name: Displayable;
  weaponType: WeaponTypeKey;
  img: string;
  rarity: Rarity;
  passiveName: Displayable;
  passiveDescription: string | ((stats: ICalculatedStats) => Displayable)
  description: Displayable;
  baseStats: {
    main: number[],
    substatKey: string,
    sub?: number[]
  },
  stats?: object | ((stats: ICalculatedStats) => object | false)
  conditionals?: IConditionals
  document?: DocumentSection[],
}