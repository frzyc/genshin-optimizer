import { ISubFormula } from "../../../../Types/character";

export const data = {
  heal: [1, 1.25, 1.5, 1.75, 2]
}
const formula: ISubFormula = {
  regen: stats => {
    const hp = data.heal[stats.weapon.refineIndex] / 100
    return [s => (hp * s.finalHP) * s.heal_multi, ["finalHP", "heal_multi"]]
  },
}
export default formula