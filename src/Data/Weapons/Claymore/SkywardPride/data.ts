import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg: [80, 100, 120, 140, 160]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical")
}
export default formula