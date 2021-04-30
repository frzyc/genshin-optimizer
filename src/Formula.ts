import ICalculatedStats from './Types/ICalculatedStats';
import { crawlObject, objPathValue } from './Util/Util';

//Currently only import character formulas, but formulas from other sources should be able to be imported as well.
export const formulaImport = import('./Data/Characters/formula').then(imp => addFormula(imp.default, "character"))

export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static formulas: any = {}
  static get = (keys: string[]): Promise<((stats: ICalculatedStats) => any[]) | undefined> => formulaImport.then(() => objPathValue(Formula.formulas, keys))
}

function addFormula(src, key) {
  Formula.formulas[key] = src
  crawlObject(src, [key], f => typeof f === "function", (formula, keys) => {
    formula.keys = keys
  })
}
