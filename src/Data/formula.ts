import { crawlObject } from '../Util/Util'
import character from './Characters/formula'
import weapon from './Weapons/formula'
const formula = {
  character,
  weapon
}

crawlObject(formula, [], f => typeof f === "function", (formula, keys) => formula.keys = keys)

export default formula