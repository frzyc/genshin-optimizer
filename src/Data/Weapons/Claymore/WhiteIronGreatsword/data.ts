import { ISubFormula } from "../../../../Types/character";

export const data = {
  heal: [8, 10, 12, 14, 16]
}
const formula: ISubFormula = {
  heal: stats => {
    const hp = data.heal[stats.weapon.refineIndex] / 100
    return [s => (hp * s.finalHP) * s.heal_multi, ["finalHP", "heal_multi"]]
  },
}
export default formula