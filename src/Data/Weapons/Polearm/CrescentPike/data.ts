import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg: [20, 25, 30, 35, 40]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical")
}
export default formula