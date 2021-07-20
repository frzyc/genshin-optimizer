import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg:  [40, 55, 70, 85, 100]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical")
}
export default formula