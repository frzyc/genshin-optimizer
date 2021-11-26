import { ISubFormula } from "../../../../Types/character";
export const data = {
  hp_atk: [1.2, 1.5, 1.8, 2.1, 2.4]
}

const formula: ISubFormula = {
  bonus: stats => [s => (s.modStats?.finalHP ?? s.finalHP) * data.hp_atk[stats.weapon.refineIndex] / 100, ['finalHP']],
}
export default formula
