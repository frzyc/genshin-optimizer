import ICalculatedStats from './Types/ICalculatedStats';
import { objPathValue } from './Util/Util';

export const formulaImport = import('./Data/formula').then(imp => {
  Formula.formulas = imp.default
  return imp.default
})

export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static formulas: any = {}
  static get = (keys: string[]): Promise<((stats: ICalculatedStats) => any[]) | object | undefined> => formulaImport.then(formulas => objPathValue(formulas, keys))
}
