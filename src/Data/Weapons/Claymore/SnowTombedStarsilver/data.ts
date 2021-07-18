import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  dmg: [80, 95, 110, 125, 140],
  dmgc: [200, 240, 280, 320, 360]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical"),
  dmgc: stats => basicDMGFormula(data.dmgc[stats.weapon.refineIndex], stats, "physical")
}
export default formula