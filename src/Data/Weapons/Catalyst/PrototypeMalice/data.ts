import { ISubFormula } from "../../../../Types/character";

export const data = {
  heal: [4, 4.5, 5, 5.5, 6]
}
const formula: ISubFormula = {
  heal: stats => {
    const hp = data.heal[stats.weapon.refineIndex] / 100
    return [s => (hp * s.finalHP) * s.heal_multi, ["finalHP", "heal_multi"]]
  },
}
export default formula