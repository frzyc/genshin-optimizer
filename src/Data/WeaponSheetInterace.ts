import ICalculatedStats from "../Build/ICalculatedStats";
import { IConditionals } from "../Conditional/IConditional";

export default interface WeaponSheet {
  name: string;
  weaponType: string;
  img: string;
  rarity: number;
  passiveName: string;
  passiveDescription: string | ((stats: ICalculatedStats) => string | JSX.Element)
  description: string;
  baseStats: {
    main: Array<number>,
    subStatKey: String,
    sub?: Array<number>
  },
  stats?: object | ((stats: ICalculatedStats) => object)
  conditionals?: IConditionals
}