import { ISubFormula } from "../../../../Types/character";

export const data = {
  shield: [20, 23, 26, 29, 32]
}
const formula: ISubFormula = {
  shield: stats => {
    const hpMulti = data.shield[stats.weapon.refineIndex] / 100
    return [s => hpMulti * s.finalHP * (1 + s.shield_ / 100) * 1.5, ["finalHP", "shield_"]]
  }
}
export default formula