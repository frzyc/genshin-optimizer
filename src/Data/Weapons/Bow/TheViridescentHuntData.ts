import { ISubFormula } from "../../../Types/character";
import { basicDMGFormula } from "../../../Util/FormulaUtil";

export const data = {
  vals: [40, 50, 60, 70, 80]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.vals[stats.weapon.refineIndex], stats, "physical")
}
export default formula