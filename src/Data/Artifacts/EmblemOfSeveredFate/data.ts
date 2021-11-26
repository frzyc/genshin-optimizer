import { ISubFormula } from "../../../Types/character"

const formula: ISubFormula = {
  s4: stats => [s => Math.min((s.premod?.enerRech_ ?? s.enerRech_), 300) * 0.25, ["enerRech_"]]
}
export default formula