import { getTalentStatKey } from '../../../../PageBuild/Build';
import { ISubFormula } from "../../../../Types/character";
export const data = {
  hp_conv: [1, 1.5, 2, 2.5, 3]
} as const

const formula: ISubFormula = {
  norm: stats => {
    const val = data.hp_conv[stats.weapon.refineIndex] / 100
    const statKey = getTalentStatKey("elemental", stats) + "_multi"
    return [s => val * s.finalHP * s[statKey], ['finalHP', statKey]]
  },
} as const
export default formula
