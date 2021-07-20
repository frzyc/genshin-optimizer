import { ISubFormula } from "../../../../Types/character";

export const data = {
  dmg_: [20, 25, 30, 35, 40],
  heal: [60, 70, 80, 90, 100]
}
const formula: ISubFormula = {
  regen: stats => {
    const hp = data.heal[stats.weapon.refineIndex] / 100
    return [s => (hp * s.finalATK) * s.heal_multi, ["finalATK", "heal_multi"]]
  },
}
export default formula