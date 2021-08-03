import { FormulaItem } from '../Types/character'
import { Path } from '../Util/KeyPathUtil'
import { crawlObject } from '../Util/Util'
import character from './Characters/formula'
import weapon from './Weapons/formula'
import artifact from './Artifacts/formula'
const formula = {
  character,
  weapon,
  artifact,
}

crawlObject(formula, [], f => typeof f === "function", (formula, keys) => formula.keys = keys)

export default formula
export type FormulaPath = Path<typeof formula, FormulaItem>
export type FormulaPathBase = typeof formula