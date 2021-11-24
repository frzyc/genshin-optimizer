import { FormulaItem, IBaseStat } from './Types/character';
import { BonusStats, ICalculatedStats, Modifier } from './Types/stats';
import { resolve } from './Util/KeyPathUtil';
import { objPathValue } from './Util/Util';

export const formulaImport = import('./Data/formula').then(imp => {
  Formula.formulas = imp.default
  return imp.default
})

export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static formulas: any = {}
  static get = (keys: string[]): Promise<((stats: ICalculatedStats) => any[]) | object | undefined> => formulaImport.then(formulas => objPathValue(formulas, keys))
  static computeModifier(stat: IBaseStat, modifier: Modifier | undefined): (s: ICalculatedStats) => BonusStats {
    if (!modifier || !Object.keys(modifier).length) return () => ({})

    // Keep objs separate here, so that it won't need to be recomputed when the modifier is triggered
    const objs = Object.entries(modifier).map(([key, formulas]) =>
      [key, formulas.map(path => Formula.getCurrent(path, stat)[0])] as [string, ((s: ICalculatedStats) => number)[]])

    return s => Object.fromEntries(objs.map(([key, formulas]) =>
      [key, formulas.reduce((a, formula) => a + formula(s), 0)]))
  }
  static getCurrent(path: string[], stat: IBaseStat): FormulaItem {
    return resolve<any, (stat: IBaseStat) => FormulaItem>(Formula.formulas, path)(stat)
  }
}
