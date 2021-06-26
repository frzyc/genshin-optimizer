import ICalculatedStats from './Types/ICalculatedStats';
import { crawlObject, objPathValue } from './Util/Util';

export const formulaImport = import('./Data/formula').then(imp => {
  Formula.formulas = imp.default
  crawlObject(imp.default, [], f => typeof f === "function", (formula, keys) => formula.keys = keys)
})

export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static formulas: any = {}
  static get = (keys: string[]): Promise<((stats: ICalculatedStats) => any[]) | object | undefined> => formulaImport.then(() => objPathValue(Formula.formulas, keys))
}
