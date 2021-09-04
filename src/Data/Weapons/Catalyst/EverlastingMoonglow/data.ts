import { ISubFormula } from "../../../../Types/character";
export const data = {
  hp_conv: [1, 1.5, 2, 2.5, 3]
} as const

const formula: ISubFormula = {
  norm: stats => [s => s.finalHP * data.hp_conv[stats.weapon.refineIndex] / 100, ['finalHP']],
} as const
export default formula
