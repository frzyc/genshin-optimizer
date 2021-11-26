import { ISubFormula } from "../../../../Types/character";
export const data = {
  enerRechConv: [28, 35, 42, 49, 56],
  enerRechMax: [80, 90, 100, 110, 120]
} as const

const formula: ISubFormula = {
  conv: stats => [s => Math.min(((s.premod?.enerRech_ ?? s.enerRech_) - 100) * data.enerRechConv[stats.weapon.refineIndex] / 100, data.enerRechMax[stats.weapon.refineIndex]), ['enerRech_']],
} as const
export default formula
