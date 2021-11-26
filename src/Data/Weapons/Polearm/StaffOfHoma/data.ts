import { ISubFormula } from "../../../../Types/character";
export const data = {
  hp_atk: [0.8, 1, 1.2, 1.4, 1.6],
  hp_atk_add: [1, 1.2, 1.4, 1.6, 1.8]
}

const formula: ISubFormula = {
  esj: stats => [s => (s.modStats?.finalHP ?? s.finalHP) * data.hp_atk[stats.weapon.refineIndex] / 100, ['finalHP']],
  esjadd: stats => [s => (s.modStats?.finalHP ?? s.finalHP) * data.hp_atk_add[stats.weapon.refineIndex] / 100, ['finalHP']],
}
export default formula
