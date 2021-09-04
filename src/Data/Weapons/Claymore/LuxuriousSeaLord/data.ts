import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg: [100, 125, 150, 175, 200],
} as const
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical"),
} as const
export default formula