import { ISubFormula } from "../../../Types/character"
import { basicHealingFormula } from "../../../Util/FormulaUtil"

const formula: ISubFormula = {
  regen: stats => basicHealingFormula(30, "finalHP")
} as const
export default formula