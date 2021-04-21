import CalculatedStats from "../Build/CalculatedStatsInterface";
import { Conditionals } from "../Conditional/Conditionalnterface";

export default interface WeaponSheet {
  name: string;
  weaponType: string;
  img: string;
  rarity: number;
  passiveName: string;
  passiveDescription: string | ((stats: CalculatedStats) => string | JSX.Element)
  description: string;
  baseStats: {
    main: Array<number>,
    subStatKey: String,
    sub?: Array<number>
  },
  stats?: object | ((stats: CalculatedStats) => object)
  conditionals?: Conditionals
}