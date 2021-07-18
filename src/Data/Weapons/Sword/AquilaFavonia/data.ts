import { ISubFormula } from "../../../../Types/character";
import { basicDMGFormula } from "../../../../Util/FormulaUtil";

export const data = {
  heal: [100, 115, 130, 145, 160],
  dmg: [200, 230, 260, 290, 320]
}
const formula: ISubFormula = {
  dmg: stats => basicDMGFormula(data.dmg[stats.weapon.refineIndex], stats, "physical"),
  heal: stats => {
    const hp = data.heal[stats.weapon.refineIndex] / 100
    return [s => (hp * s.finalATK) * s.heal_multi, ["finalATK", "heal_multi"]]
  },
}
export default formula