import { crawlObject, objPathValue } from './Util/Util';
export let CharacterFormulaImport = import('./Data/Characters/formula')
CharacterFormulaImport.then(imp => {
  addFormula(imp.default, "character")
  CharacterFormulaImport = null
})
export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static formulas = {}
  static get = (keys, defVal = null) => objPathValue(this.formulas, keys) ?? defVal
}

function addFormula(src, key) {
  Formula.formulas[key] = src
  crawlObject(src, [key], f => typeof f === "function", (formula, keys) => {
    formula.keys = keys
  })
}
