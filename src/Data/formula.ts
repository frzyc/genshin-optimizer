import { FormulaItem } from '../Types/character'
import { Path } from '../Util/KeyPathUtil'
import { crawlObject } from '../Util/Util'
/**
 * @deprecated
 */
const formula = {
  character: {},
  weapon: {},
  artifact: {},
}

crawlObject(formula, [], f => typeof f === "function", (formula, keys) => formula.keys = keys)

export default formula
export type FormulaPath = Path<any, FormulaItem>
export type FormulaPathBase = any
