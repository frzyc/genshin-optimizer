import { ISubFormula } from "../../../Types/character"

const formula: ISubFormula = {
  dmg: stats => [s => 30000 * 0.9 * s.physical_enemyRes_multi, ["physical_enemyRes_multi"]]
} as const
export default formula