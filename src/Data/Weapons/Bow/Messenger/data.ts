import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg: [100, 125, 150, 175, 200]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical")
}
export default formula