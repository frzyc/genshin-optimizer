import { getTalentStatKey } from "../../../../Build/Build";
import { ISubFormula } from "../../../../Types/character";
export const data = {
  defConv: [40, 50, 60, 70, 80],
} as const

const formula: ISubFormula = {
  skill: stats => {
    const val = data.defConv[stats.weapon.refineIndex] / 100
    const statKey = getTalentStatKey("skill", stats) + "_multi"
    return [s => val * s.finalDEF * s[statKey], ['finalDEF', statKey]]
  },
} as const
export default formula
