import { getTalentStatKey } from '../../../../PageBuild/Build';
import { ISubFormula } from "../../../../Types/character";
export const data = {
  defConv: [40, 50, 60, 70, 80],
} as const

const formula: ISubFormula = {
  normal: stats => {
    const val = data.defConv[stats.weapon.refineIndex] / 100
    const statKey = getTalentStatKey("normal", stats) + "_multi"
    return [s => val * s.finalDEF * s[statKey], ['finalDEF', statKey]]
  },
  charged: stats => {
    const val = data.defConv[stats.weapon.refineIndex] / 100
    const statKey = getTalentStatKey("charged", stats) + "_multi"
    return [s => val * s.finalDEF * s[statKey], ['finalDEF', statKey]]
  },
} as const
export default formula
