import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(200, stats, "physical")
}
export default formula