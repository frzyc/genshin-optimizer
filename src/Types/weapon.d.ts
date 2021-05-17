import ICalculatedStats from "./ICalculatedStats";
import { IConditionals } from "./IConditional";

export type IWeaponSheets = Dict<string, IWeaponSheet>

export interface IWeaponSheet {
  name: Displayable;
  weaponType: WeaponTypeKey;
  img: string;
  rarity: number;
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
}